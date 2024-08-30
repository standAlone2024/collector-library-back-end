import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { transliterate } from 'transliteration';
import sharp from 'sharp';
import { recognizeText } from '../utils/tesseractWorker';
import { printLog } from '../utils/utils';

const DIRECTORY_ORIGIN = 'origin';
const DIRECTORY_THUMB = 'thumbnail';
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

export const uploadImage = async (req: Request, res: Response) => {
  printLog('upload');
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;
    const path = req.body.path;
    const file = req.file;
    const extension = file.originalname.split('.').pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return res.status(400).json({ message: "Invalid file type. Allowed types are: " + ALLOWED_EXTENSIONS.join(', ') });
    }

    const uuid = uuidv4();
    const nameWithoutExtension = file.originalname.split('.').slice(0, -1).join('.');
    
    const transliteratedName = transliterate(nameWithoutExtension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);

    const fileName = `${uuid}-${transliteratedName}.${extension}`;

    // 병렬 처리를 위한 Promise.all 사용
    const [originalPath, thumbnailBuffer, extractedText] = await Promise.all([
      //TODO path를 받아서 section과 book의 디렉토리를 구별해야 좋을 듯
      //S3의 주소 https://collector-library.s3.ap-northeast-2.amazonaws.com/는 생략하고 보내도 될 듯
      uploadToS3(file.buffer, userId, path, DIRECTORY_ORIGIN, fileName, file.mimetype),
      sharp(file.buffer).resize(114, 164, { fit: 'cover' }).toBuffer(),
      recognizeText(file.buffer)
    ]);

    const thumbnailPath = await uploadToS3(thumbnailBuffer, userId, path, DIRECTORY_THUMB, fileName, 'image/jpeg');

    const imageResult: IImageResult = {
      original_path: originalPath,
      thumbnail_path: thumbnailPath,
      original_fileName: file.originalname,
      extracted_text: '',
    };

    // printLog(imageResult);

    res.status(201).json({ imageResult });
  } catch (error) {
    console.error("Image upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return res.status(500).json({ message: "Image upload failed", error: errorMessage });
  }
};

const uploadToS3 = async (
  body: Buffer,
  userId: number,
  rootPath: string,
  directoryPath: string,
  fileName: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: `${rootPath}/${userId}/${directoryPath}/${fileName}`,
    Body: body,
    ContentType: contentType
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    // return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return `/${params.Key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

interface IImageResult {
  original_path: string,
  thumbnail_path: string,
  original_fileName: string,
  extracted_text?: string
}
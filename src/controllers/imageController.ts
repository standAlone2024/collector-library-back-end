import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { transliterate } from 'transliteration';
import sharp from 'sharp';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
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

const resize = async(fileBuffer: Buffer, maxWidth: number) => {
  let image = sharp(fileBuffer);
  const metadata = await image.metadata();

  if(metadata.width && metadata.width > maxWidth)
    return await sharp(fileBuffer).rotate().resize({width: maxWidth, fit: sharp.fit.contain, withoutEnlargement: true}).toBuffer();
  else
    return await sharp(fileBuffer).rotate().toBuffer();
}

const vision = new ImageAnnotatorClient({
  keyFilename: path.resolve(__dirname, process.env.GOOGLE_CLOUD_VISION_KEY_PATH as string),
});

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;
    const rootPath = req.body.rootPath;
    const file = req.file;
    const uuid = uuidv4();

    printLog(userId, rootPath);

    const originalName = file.originalname;
    const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
    const extension = originalName.split('.').pop()?.toLowerCase();
    
    const transliteratedName = transliterate(nameWithoutExtension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return res.status(400).json({ message: "Invalid file type. Allowed types are: " + ALLOWED_EXTENSIONS.join(', ') });
    }

    const fileName = `${uuid}-${transliteratedName}.${extension}`;

    
    const [originalBuffer, thumbnailBuffer] = await Promise.all([
      resize(file.buffer, 1000),
      resize(file.buffer, 120),
    ]);
    
    const [originalPath, thumbnailPath, extractedTextArray] = await Promise.all([
      uploadToS3(originalBuffer, userId, rootPath, DIRECTORY_ORIGIN, fileName, file.mimetype),
      uploadToS3(thumbnailBuffer, userId, rootPath, DIRECTORY_THUMB, fileName, file.mimetype),
      performOCR(file.buffer)
    ]);

    const imageResult: IImageResult = {
      original_path: originalPath,
      thumbnail_path: thumbnailPath,
      original_fileName: file.originalname,
      extracted_text: extractedTextArray,
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
    return `/${params.Key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const performOCR = async (imageBuffer: Buffer): Promise<string[]> => {
  try {
    const [result] = await vision.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    if (detections && detections.length > 0) {
      // 첫 번째 요소는 전체 텍스트이므로 제외하고, 나머지 단어들을 배열로 반환
      return detections.slice(1)
        .map(detection => detection.description)
        .filter((description): description is string => description !== null && description !== undefined);
    }
    return [];
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
};

interface IImageResult {
  original_path: string,
  thumbnail_path: string,
  original_fileName: string,
  extracted_text?: string[]
}
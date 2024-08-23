import { Request, Response } from 'express';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { printLog } from '../utils/utils';

const DIRECTORY_ORIGIN = 'origin';
const DIRECTORY_THUMB = 'thumbnail';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.body.userId;
    const file = req.file;
    const uuid = uuidv4();
    const fileName = `${uuid}-${file.originalname}`;

    // 원본 이미지 업로드
    const originalPath = await uploadToS3(file.buffer, userId, DIRECTORY_ORIGIN, fileName, file.mimetype);
    // 썸네일 생성
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(114, 164, { fit: 'cover' })
      .toBuffer();
    // 썸네일 업로드
    const thumbnailPath = await uploadToS3(thumbnailBuffer, userId, DIRECTORY_THUMB, fileName, 'image/jpeg');

    res.json({
      originalPath,
      thumbnailPath
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

const uploadToS3 = async (
  body: Buffer,
  userId: number,
  directoryPath: string,
  fileName: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME as string,
    Key: `sections/${userId}/${directoryPath}/${fileName}`,
    Body: body,
    ContentType: contentType
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};
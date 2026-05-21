import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
  region: "us-east-1", 
  endpoint: "http://minio:9000", 
  forcePathStyle: true, 
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  },
});

const BUCKET_NAME = "loja-jm";
const UPLOADS_PATH = path.resolve("uploads");

const mimeTypes = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.png':  'image/png' 
};

async function runMigration() {
  try {
    const files = fs.readdirSync(UPLOADS_PATH);

    for (const file of files) {
      const filePath = path.join(UPLOADS_PATH, file);
      
      if (fs.lstatSync(filePath).isDirectory()) continue;

      const extension = path.extname(file).toLowerCase();
      const contentType = mimeTypes[extension] || 'application/octet-stream';

      try {
        await s3Client.send(new HeadObjectCommand({ 
            Bucket: BUCKET_NAME, 
            Key: file 
        }));
        console.log(`[-] Skip: ${file}`);
      } catch (error) {
        const fileBuffer = fs.readFileSync(filePath);

        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file,
          Body: fileBuffer,
          ContentType: contentType,
        }));

        console.log(`[+] Upload: ${file} (${contentType})`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runMigration();

export default s3Client;
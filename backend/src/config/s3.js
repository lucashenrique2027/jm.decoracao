import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.MINIO_REGION, 
  endpoint: "http://minio:9000", 
  forcePathStyle: true, 
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  },
});

export default s3Client;
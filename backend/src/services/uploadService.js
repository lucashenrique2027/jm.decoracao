import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";
import crypto from "crypto";

// Função auxiliar para verificar existência (Idempotência)
export const imageExistsInMinio = async (fileName) => {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: "loja-jm",
      Key: fileName
    }));
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
};

export const uploadImageToMinio = async (file, forceName = null) => {
  const fileName = forceName || `${crypto.randomBytes(10).toString("hex")}-${file.originalname}`;

  const exists = await imageExistsInMinio(fileName);
  if (exists) {
    console.log(`Pulo: ${fileName} já existe no MinIO.`);
    return fileName;
  }

  const params = {
    Bucket: "loja-jm",
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return fileName;
  } catch (error) {
    console.error("Erro técnico no upload:", error);
    throw new Error("Falha ao processar o upload.");
  }
};
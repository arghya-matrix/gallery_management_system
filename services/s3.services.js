const S3client = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");

const s3client = new S3client.S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

async function putObject({ file, name }) {
  console.log("S3 region", process.env.AWS_REGION);
  const fileExtension = path.extname(file.originalname);

  const text = name;
  const textWithoutSpaces = text.replace(/\s/g, "");
  const fileName = `${textWithoutSpaces}_${Date.now()}${fileExtension}`;
  const key = `arghya_mallick/gms/${fileName}`;
  const command = new S3client.PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ACL: process.env.AWS_ACL,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3client.send(command);
    console.log(`File uploaded to S3: ${key}`);
    return `${process.env.AWS_ENDPOINT}/${key}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error; // Handle the error as needed
  }
}

async function deleteObject({ fileName }) {
  const key = fileName;
  const command = new S3client.DeleteObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });
  try {
    await s3client.send(command);
    console.log(`File deleted to S3: ${key}`);
    return `file deleted`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error; // Handle the error as needed
  }
}

module.exports = {
  putObject,
  deleteObject,
};

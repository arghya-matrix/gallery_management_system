const S3client = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");

const s3client = new S3client.S3Client({
  region: "ap-south-1",
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
  const command = new S3client.PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `arghya_mallick/gms/${fileName}`,
    ACL: process.env.AWS_ACL,
    Body: file.buffer,
  });

  try {
    await s3client.send(command);
    console.log(`File uploaded to S3: ${command.Key}`);
    return getSignedUrl(s3client, command); // Return the signed URL
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error; // Handle the error as needed
  }
}

module.exports = {
  putObject,
};

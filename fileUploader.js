const AWS = require("aws-sdk");
const parseMultipart = require("parse-multipart");
const path = require("path");
const BUCKET = process.env.BUCKET;

const s3 = new AWS.S3();

module.exports.uploadFile = async (event) => {
  try {
    const { filename, data } = extractFile(event);
    if (path.extname(filename) != ".txt") {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Only .txt files are allowed" }),
      };
    }
    let baseName=path.basename(filename, '.txt');
    
    await s3
      .putObject({
        Bucket: BUCKET,
        Key: `${baseName}/${baseName}_Original.txt`,
        Body: data,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${filename} was uploaded to the bucket : ${BUCKET}.s3.amazonaws.com`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.stack }),
    };
  }
};

function extractFile(event) {
  const boundary = parseMultipart.getBoundary(event.headers["content-type"]);
  const parts = parseMultipart.Parse(
    Buffer.from(event.body, "base64"),
    boundary
  );
  const [{ filename, data }] = parts;

  return {
    filename,
    data,
  };
}

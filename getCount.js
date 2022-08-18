const aws = require("aws-sdk");
const s3 = new aws.S3();
const BUCKET = process.env.BUCKET;

module.exports.getWordCount = async (event, context) => {
  try {
    const { fileName } = event.pathParameters;

    let data = await s3
      .getObject({
        Bucket: BUCKET,
        Key: `${fileName}/${fileName}_Count.txt`,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        wordCount: Buffer.from(data?.Body).toString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.stack }),
    };
  }
};

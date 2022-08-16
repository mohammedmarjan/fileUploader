const aws = require("aws-sdk");
const s3 = new aws.S3();
const outputBucket = process.env.OUTPUT_BUCKET;

module.exports.count = (event, context) => {
  if (event.Records === null) {
    context.fail("Error: Event has no records.");
    return;
  }
  let tasks = [];
  for (let i = 0; i < event.Records.length; i++) {
    tasks.push(processRecord(event.Records[i]));
  }

  Promise.all(tasks)
    .then(() => {
      context.succeed();
    })
    .catch((err) => {
      console.log("Error : ", err);
      context.fail();
    });
};

function processRecord(record) {
  return new Promise((resolve, reject) => {
    // The source bucket and source key are part of the event data
    var srcBucket = record.s3.bucket.name;
    var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    try {
      s3.getObject(
        {
          Bucket: srcBucket,
          Key: srcKey,
        },
        (err, data) => {
          if (err) {
            reject(err);
          }
          countWords(data)
            .then((wordCount) => {
              return uploadResult(wordCount, outputBucket, srcKey);
            })
            .then((data) => resolve())
            .catch((err) => reject(err));
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

function countWords(data) {
  return new Promise((resolve, reject) => {
    let dataString = data.Body.toString();
    let wordCount = dataString.split(" ").length;
    resolve(wordCount);
  });
}

function uploadResult(wordCount, destBucket, srcKey) {
  return new Promise((resolve, reject) => {
    srcKey = "count_" + srcKey;
    s3.putObject(
      {
        Bucket: destBucket,
        Key: srcKey,
        Body: wordCount.toString(),
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve();
      }
    );
  });
}

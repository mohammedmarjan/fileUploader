const aws = require("aws-sdk");
const path = require("path");
const s3 = new aws.S3();

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
    // var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    var srcKey = record.s3.object.key;

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
              return uploadResult(wordCount, srcBucket, srcKey);
            })
            .then((data) => resolve(data))
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
    try {
      let dataString = data.Body.toString();
      let wordCount = dataString.split(" ").length;
      resolve(wordCount);
    } catch (err) {
      reject(err);
    }
  });
}

function uploadResult(wordCount, destBucket, destKey) {
  return new Promise((resolve, reject) => {
    let dirName = path.dirname(destKey);
    let baseName = path.basename(destKey, "_Original.txt");
    destKey = `${dirName}/${baseName}_Count.txt`;

    s3.putObject(
      {
        Bucket: destBucket,
        Key: destKey,
        Body: wordCount.toString(),
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
}

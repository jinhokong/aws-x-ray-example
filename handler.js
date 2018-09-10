"use strict";
const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));
const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export const hello = function(event, context, callback) {
  AWSXRay.captureAsyncFunc("throw Error", function(subsegment) {
    const params = {
      Bucket: "awsgeorge-2",
      Key: "key",
      Body: "mybody"
    };

    s3.putObject(params, function(err, data) {
      if (err) {
        subsegment.addAnnotation("error", "error");
        subsegment.addMetadata("error", err.stack);
      }

      subsegment.close();
    });
  });

  AWSXRay.captureAsyncFunc("dynamo-DB", function(subsegment) {
    const params = {
      TableName: "Buckets",
      Item: {
        key: "key" + Date.now()
      }
    };
    docClient.put(params, function(err, data) {
      if (err) {
        subsegment.addAnnotation("error", "error");
        subsegment.addMetadata("error", err.stack);
        console.log("Error", err);
      } else {
        console.log(data);
      }
      subsegment.close();
    });
  });
  AWSXRay.captureAsyncFunc("SQS", function(subsegment) {
    const sqsParams = {
      MessageBody: "SQS is work",
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/600625560026/XRaySqs"
    };

    sqs.sendMessage(sqsParams, (err, data) => {
      if (err) {
        subsegment.addAnnotation("error", "error");
        subsegment.addMetadata("error", err.stack);
        console.log("Error", err);
      } else {
        console.log(data);
      }
      subsegment.close();
    });
  });

  callback(null, { body: "success!!!" });
};

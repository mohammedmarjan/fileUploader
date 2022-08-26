# fileUploader
This code setup allows you to upload a text file, and get the word count.

## Functional Diagram
![alt text](https://github.com/mohammedmarjan/fileUploader/blob/dev/FunctionalDiagram.jpg?raw=true)

## Setup

```bash
npm install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

## Usage

You can upload file with the following commands:

### Upload a File

```bash
[POST] https://XXXXXXX.execute-api.us-east-1.amazonaws.com/<stage>/file/upload
```

Example output:
```bash
{
	"message": "<fileName> was uploaded to the bucket :<BucketName>"
}
```

### Get the word count of a file

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/<stage>/file/getWordCount/<fileName>
```

Example Result:
```bash
{
	"wordCount": <wordCount>
}
```


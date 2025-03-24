const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const logger = require('./logger'); 
const { minioClient, bucketName, getBuckets, getAllFilesFromBucket, checkExistance } = require('./db-clients/minio');

require('dotenv').config();

const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
      logger.error('No file received in the request.');
    }
    
    const fileName = Date.now() + path.extname(req.file.originalname);
    logger.debug(`Uploading file: ${fileName}`);
    
    minioClient.putObject(bucketName, fileName, req.file.buffer, (err, etag) => {
      if (err) {
        logger.error(`Error uploading file to MinIO: ${err.message}`);
      }
      logger.info(`File uploaded successfully with etag: ${etag}`);
      res.json({ message: 'Video uploaded successfully', fileName });
    });
  });
  
 app.get('/video/:fileName', async (req, res) => {
    if (!req.params.fileName) {
        logger.error(`No file received in the request`);
    }
    
    const fileName = req.params.fileName;
    console.log(fileName);
    // logger.debug(`Retrieving video file: ${fileName}`);
  
    // minioClient.getObject(bucketName, fileName, (err, dataStream) => {
    //   if (err) {
    //     logger.error(`Error retrieving video from MinIO: ${err.message}`);
    //   }
    //   console.log("DATA STREAM",dataStream);

    //   res.setHeader('Content-Type', 'video/mp4');
    //   logger.info(`Successfully retrieved video file: ${fileName}`);
    //   dataStream.pipe(res);
    // });

    // try {
        // await checkExistance(fileName);        
        // Get object stream  1742771550342
        let chunks = [];
        const dataStream = await minioClient.getObject(bucketName, fileName)
        console.log("DATASTREAM", dataStream);
        dataStream.on('data', (chunk) => {
          chunks.push(chunk);
        });
        dataStream.on('end', () => {
          const videoBuffer = Buffer.concat(chunks);
          console.log(videoBuffer)
          fs.writeFile('output.mp4', videoBuffer, (err) => {
            if (err) {
              console.error('Error writing the file:', err);
            } else {
              console.log('The file has been saved as output.jpg');
            }
          });
        });

        // res.setHeader('Content-Type', 'video/mp4');
        // res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

        // // Pipe the stream to response
        // dataStream.pipe(res);
        
        // dataStream.on('error', (err) => {
        //     logger.error('Stream error', err);
        // });

    // } catch (err) {
    //     logger.error('Error:', err);
    //     if (err.code === 'NotFound') {
    //         logger.error('Video not found');
    //     } else {
    //         logger.error('Server error');
    //     }
    // }
  }); 

app.get('/buckets', async (req, res) => {
  const buckets = await getBuckets();
  res.json(buckets);
});

app.get('/all', async (req, res) => (
    getAllFilesFromBucket()
));

app.get('/image', async (req, res) => {
  let chunks = [];

  const dataStream = await minioClient.getObject(bucketName, '1742784795151.jpg');
  dataStream.on('data', (chunk) => {
    chunks.push(chunk);
  });
  dataStream.on('end', () => {
    const imageBuffer = Buffer.concat(chunks);
    console.log(imageBuffer)
    fs.writeFile('output.jpg', imageBuffer, (err) => {
      if (err) {
        console.error('Error writing the file:', err);
      } else {
        console.log('The file has been saved as output.jpg');
      }
    });
  });
})

app.listen(port, () => {
logger.info(`Server running on port ${port}`);
});
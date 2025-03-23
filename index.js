const express = require('express');
const multer = require('multer');
const path = require('path');
const Minio = require('minio');
const logger = require('./logger'); 
const minioClient = require('./db-clients/minio');
const bucketName = require('./db-clients/minio');

require('dotenv').config();

const app = express();
const port = 3000;


// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
      logger.error('No file received in the request.');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileName = Date.now() + path.extname(req.file.originalname);
    logger.debug(`Uploading file: ${fileName}`);
    
    minioClient.putObject(bucketName, fileName, req.file.buffer, (err, etag) => {
      if (err) {
        logger.error(`Error uploading file to MinIO: ${err.message}`);
        return res.status(500).json({ error: 'Error uploading file to MinIO', details: err.message });
      }
      logger.info(`File uploaded successfully with etag: ${etag}`);
      res.json({ message: 'Video uploaded successfully', fileName });
    });
  });
  
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
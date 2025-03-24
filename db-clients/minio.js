const Minio = require('minio');
const logger = require('../logger');
const dotenv = require('dotenv');

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,    // Default MinIO access key
    secretKey: process.env.MINIO_SECRET_KEY     // Default MinIO secret key
});

const bucketName = 'videos';

minioClient.bucketExists(bucketName, (err) => {
    if (err) {
      logger.error(`Error checking bucket existence: ${err.message}`);
      minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
        if (err) {
          logger.error(`Error creating bucket: ${err.message}`);
        } else {
          logger.info('Bucket created successfully.');
        }
      });
    } else {
      logger.info('Bucket already exists.');
    }
});

const getBuckets = async () => {
  const buckets = await minioClient.listBuckets();
  return buckets;
};

const getAllFilesFromBucket = async () => {
    const objectsStream = minioClient.listObjects(bucketName, '', true);
    objectsStream.on('data', (obj) => {
        console.log('Object found:', obj.name);
    });
    objectsStream.on('error', (err) => {
        console.error('Error listing objects:', err);
    });
};

const checkExistance = async (filename) => {
    try{
        await minioClient.statObject(bucketName, filename); 
    }
    catch(e){
        logger.error('File not found', e);
    }
}

// const getObjectByName = async (filename) => {
//     try {
//         const stream = await minioClient.getObject(bucketName, filename);
//         return stream;
//     }
//     catch(e){
//         logger.error('Error retrieving the file', e);
//     }
// }

module.exports = {
  minioClient,
  bucketName,
  getBuckets,
  getAllFilesFromBucket,
  checkExistance,
};

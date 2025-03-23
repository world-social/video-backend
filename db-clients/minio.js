const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
  });
  const bucketName = 'videos';

  minioClient.bucketExists(bucketName, (err) => {
      if (err) {
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

module.exports = minioClient;
module.exports = bucketName;
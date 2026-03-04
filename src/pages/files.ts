import express from 'express';
import bodyParser from 'body-parser';
import { authenticateToken } from '../util/authToken';
import multer from 'multer';
import { GetToStream, Upload } from '../util/s3';
import { randomUUID } from 'node:crypto';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route POST /files/upload
 */
router.post('/upload',
   authenticateToken,
   multer().single('file'),
  async (req: any, res: any) => {
  const allowedExtentions = ["png", "jpg", "jpeg"]

  if(!req.file) {
    res.status(403).send({message: "No file included"});
    return
  }

  const fileExtension: string = req.file.originalname.split('.').pop();
  const filename: string = `${randomUUID()}.${fileExtension}`;

  if(!allowedExtentions.includes(fileExtension)) {
    res.status(400).send({message: "File must be an image"});
    return
  }

  await Upload(process.env.S3_BUCKET_NAME || "", req.file, filename);
  res.status(201).send({key: filename});
});

/**
 * @route GET /files/fileName
 */
router.get('/:file', async (req: any, res: any) => {
  res.set({
        'Content-Type': 'image/png',
      })
  GetToStream(process.env.S3_BUCKET_NAME || "", req.params.file, res)
  .catch(e => {
    res.status(404).send({message: `File ${req.params.file} not found`})
  })
});

export default router;
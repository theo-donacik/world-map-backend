import S3 from 'aws-sdk/clients/s3.js'; 
import { PutObjectOutput, PutObjectRequest, GetObjectRequest, GetObjectOutput } from 'aws-sdk/clients/s3';
import {AWSError} from 'aws-sdk/lib/error';

export async function Upload(bucket: string, file: Express.Multer.File, objectName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const s3: S3 = Connect();
        const params: PutObjectRequest = { Bucket: bucket, Key: objectName, Body: file.buffer, ACL: 'public-read', ContentType: file.mimetype };
        s3.putObject(params, (err: AWSError, data: PutObjectOutput) => {
            if (err) reject(err);
            resolve(objectName);
        });
    });
}

export async function GetToStream(bucket: string, objectName: string, buffer: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const s3: S3 = Connect();
        const params: GetObjectRequest = { Bucket: bucket, Key: objectName};

        const data = s3.getObject(params)
        data.createReadStream()
        .on('error', (e) => {
          reject(e)
        })
        .pipe(buffer)
        .on('data', () => {
          resolve(objectName)
        })
    });
}


export function Connect(): S3 {
    return new S3({
        apiVersion: 'latest',
        endpoint: `${process.env.S3_ENDPOINT_URL}${process.env.S3_BUCKET_NAME}`,
        region: `${process.env.S3_DEFAULT_REGION}`,
        s3ForcePathStyle: true,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || "",
            secretAccessKey: process.env.S3_SECRET_KEY || "",
        },
    });
}

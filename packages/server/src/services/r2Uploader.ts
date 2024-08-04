import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


export interface R2Config {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    accountId: string;
    domainName?: string;
}

export class R2Uploader {
    private client: S3Client;
    private bucketName: string;
    private domainName: string;

    constructor(config: R2Config) {
        this.client = new S3Client({
            region: "auto",
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
        this.bucketName = config.bucketName;
        this.domainName = config && config.domainName ? config.domainName : `${config.bucketName}.${config.accountId}.r2.cf`;
    }

    async uploadBuffer(buffer: Buffer, key: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'application/pdf',
        });

        await this.client.send(command);
        return `https://${this.domainName}/${key}`;
    }
}
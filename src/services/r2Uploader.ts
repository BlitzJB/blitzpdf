import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


interface R2Config {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    accountId: string;
    domainName?: string;
}

export class R2Uploader {
    private client: S3Client;
    private bucketName: string;
    private domainName = "r2.cloudflarestorage.com";

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
        this.domainName = config && config.domainName ? config.domainName : this.domainName;
    }

    async uploadBuffer(buffer: Buffer, key: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
        });

        await this.client.send(command);
        return `https://${this.bucketName}.${this.domainName}/${key}`;
    }
}
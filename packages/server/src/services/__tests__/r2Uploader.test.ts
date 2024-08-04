import { R2Config, R2Uploader } from '../r2Uploader';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

jest.mock("@aws-sdk/client-s3");

describe('R2Uploader', () => {
    const mockConfig = {
        bucketName: 'test-bucket',
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        accountId: 'test-account-id',
        domainName: 'test-domain-name',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should upload a buffer successfully', async () => {
        const uploader = new R2Uploader(mockConfig as R2Config);
        const mockBuffer = Buffer.from('test-content');
        const mockKey = 'test-key';

        (S3Client.prototype.send as jest.Mock).mockResolvedValue({});

        await uploader.uploadBuffer(mockBuffer, mockKey);

        expect(S3Client).toHaveBeenCalledWith(expect.any(Object));
        expect(PutObjectCommand).toHaveBeenCalledWith({
            Bucket: mockConfig.bucketName,
            Key: mockKey,
            Body: mockBuffer,
        });
        expect(S3Client.prototype.send).toHaveBeenCalled();
    });

    it('should return the correct URL after upload', async () => {
        const uploader = new R2Uploader(mockConfig as R2Config);
        const mockBuffer = Buffer.from('test-content');
        const mockKey = 'test-key';

        (S3Client.prototype.send as jest.Mock).mockResolvedValue({});

        const result = await uploader.uploadBuffer(mockBuffer, mockKey);

        expect(result).toBe(`https://${mockConfig.domainName}/${mockKey}`);
    });
});
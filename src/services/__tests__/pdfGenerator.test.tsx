import { generatePDF } from '../pdfGenerator';
import puppeteer from 'puppeteer';
import pdfParse from 'pdf-parse';

describe('pdfGenerator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a PDF with correct content', async () => {
        const componentString = `
            export default function Component({title, content, items}) {
                return (
                    <div>
                        <h1>{title}</h1>
                        <p>{content}</p>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                );
            }
        `;
        const data = { title: 'Test Title', content: 'Test Content', items: ['Item 1', 'Item 2'] };

        const url = await generatePDF(componentString, data);

        expect(url).toContain('pdf_');

        const response = await fetch(url);
        const pdfBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(pdfBuffer);

        let pdfData = await pdfParse(buffer);

        expect(pdfData.text).toContain(data.title);
        expect(pdfData.text).toContain(data.content);
        expect(pdfData.text).toContain(data.items[0]);
        expect(pdfData.text).toContain(data.items[1]);
    });
});
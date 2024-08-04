import React from 'react';
import ReactDOMServer from 'react-dom/server';
import puppeteer from 'puppeteer';
import { buildTailwindCSS } from './cssBuilder';
import { evalComponent } from './componentEvaluator';
import { R2Uploader } from './r2Uploader';
import dotenv from 'dotenv';
dotenv.config();

function WrapperComponent({ children }: { children: React.ReactNode }) {
    return <html>
        <head>
            <style id="tailwind-css"></style>
        </head>
        <body>
            {children}
        </body>
    </html>
}

export async function generatePDF(componentString: string, data: Record<string, any>, tailwindConfig: Record<string, any> = {}): Promise<string> {
    const PDFDocument = evalComponent(componentString);

    const html = ReactDOMServer.renderToStaticMarkup(
        <WrapperComponent>
            <PDFDocument {...data} />
        </WrapperComponent>
    );

    console.log('HTML generated ', html);

    const css = await buildTailwindCSS(html, tailwindConfig);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    await page.evaluate((css: string) => {
        const styleElement = document.getElementById('tailwind-css');
        if (styleElement) {
            styleElement.textContent = css;
        }
    }, css);

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    console.log('PDF generated successfully!');

    const r2Config = {
        bucketName: process.env.R2_BUCKET_NAME!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        accountId: process.env.R2_ACCOUNT_ID!,
        domainName: process.env.R2_DOMAIN_NAME
    }

    const uploader = new R2Uploader(r2Config);

    const key = `pdf_${Date.now()}.pdf`;
    const url = await uploader.uploadBuffer(pdfBuffer, key);

    console.log('PDF uploaded successfully:', url);

    return url;
}
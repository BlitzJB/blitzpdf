import React from 'react';
import ReactDOMServer from 'react-dom/server';
import puppeteer, { Browser, Page, errors } from 'puppeteer';
import { buildTailwindCSS } from './cssBuilder';
import { evalComponent } from './componentEvaluator';
import { R2Uploader, R2Config } from './r2Uploader';
import dotenv from 'dotenv';
dotenv.config();
import { getOrCreateTemplateData, getComponent } from './templateService';

const MAX_RETRIES = 3;

function timeIt(label: string, fn: () => any) {
    console.time(label);
    const output = fn();
    console.timeEnd(label);
    return output;
}

async function timeItAsync(label: string, fn: () => Promise<any>) {
    console.time(label);
    const output = await fn();
    console.timeEnd(label);
    return output;
}

function WrapperComponent({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <style id="tailwind-css"></style>
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}

// Singleton instance of the puppeteer browser
let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

async function setPageHeightToContent(page: Page) {
    const contentHeight = await page.evaluate(() => {
        return document.body.scrollHeight;
    });
    await page.setViewport({ width: 1200, height: contentHeight });
}

async function createPageWithRetry(browser: Browser, retries = MAX_RETRIES): Promise<Page> {
    try {
        if (!pageInstance || pageInstance.isClosed()) {
            pageInstance = await browser.newPage();
        }
        return pageInstance;
    } catch (error) {
        if (error instanceof Error && error.name === 'TargetCloseError' && retries > 0) {
            console.warn(`TargetCloseError occurred. Retrying... (${retries} attempts left)`);
            return createPageWithRetry(browser, retries - 1);
        }
        throw error;
    }
}

async function recreateBrowserIfNeeded(): Promise<Browser> {
    if (!browserInstance || !browserInstance.isConnected()) {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browserInstance;
}

export async function generatePDF(
    componentString: string, 
    data: Record<string, any>, 
    tailwindConfig: Record<string, any> = {},
    upload: boolean = false
): Promise<string | Buffer> {
    const PDFDocument = timeIt("evaluate react component", () => evalComponent(componentString));

    const html = timeIt("react render", () => ReactDOMServer.renderToStaticMarkup(
        <WrapperComponent>
            <PDFDocument {...data} />
        </WrapperComponent>
    ))

    const css = await timeItAsync("tailwind build", async () => await buildTailwindCSS(html, tailwindConfig));

    let pdfBuffer: Buffer;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            const browser = await timeItAsync("puppeteer create", async () => await recreateBrowserIfNeeded());
            const page = await timeItAsync("page create", () => createPageWithRetry(browser));

            await page.setContent(html);

            await page.evaluate((css: string) => {
                const styleElement = document.getElementById('tailwind-css');
                if (styleElement) {
                    styleElement.textContent = css;
                }
            }, css);

            await setPageHeightToContent(page);

            pdfBuffer = await timeItAsync("pdf create", async () => await page.pdf({ format: 'A4', printBackground: true }));
            break;
        } catch (error) {
            if (error instanceof Error && error.name === 'TargetCloseError') {
                attempts++;
                console.error(`TargetCloseError occurred (attempt ${attempts}):`, error);
                if (attempts >= MAX_RETRIES) {
                    throw new Error('Failed to generate PDF after multiple attempts due to TargetCloseError');
                }
                // Reset instances to force recreation on next attempt
                pageInstance = null;
                browserInstance = null;
            } else {
                // For any other error, throw immediately
                throw error;
            }
        }
    }

    if (upload) {
        return await uploadToR2(pdfBuffer!);
    }

    return pdfBuffer!;
}

async function uploadToR2(pdfBuffer: Buffer): Promise<string> {
    const r2Config: R2Config = {
        bucketName: process.env.R2_BUCKET_NAME!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        accountId: process.env.R2_ACCOUNT_ID!,
        domainName: process.env.R2_DOMAIN_NAME
    };

    const uploader = new R2Uploader(r2Config);

    const key = `pdf_${Date.now()}.pdf`;
    const url = await timeItAsync("upload r2", async () => await uploader.uploadBuffer(pdfBuffer, key))

    console.log('PDF uploaded successfully:', url);

    return url;
}

async function getPuppeteerBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browserInstance;
}

async function createPage(browser: Browser | null): Promise<Page> {
    if (!browser) {
        throw new Error('Browser instance is required to create a new page');
    }
    if (!pageInstance) {
        pageInstance = await browser.newPage();
    }
    return pageInstance;
}

export async function generatePDFFromTemplate(
    templateId: string,
    data: Record<string, any>,
    upload: boolean = false
): Promise<string | Buffer> {
    const templateData = await getOrCreateTemplateData(templateId);
    const PDFDocument = getComponent(templateData);

    const html = timeIt("react render", () => ReactDOMServer.renderToStaticMarkup(
        <WrapperComponent>
            <PDFDocument {...data} />
        </WrapperComponent>
    ));

    let pdfBuffer: Buffer;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            const browser = await timeItAsync("puppeteer create", async () => await recreateBrowserIfNeeded());
            const page = await timeItAsync("page create", () => createPageWithRetry(browser));

            await page.setContent(html);

            await page.evaluate((css: string) => {
                const styleElement = document.getElementById('tailwind-css');
                if (styleElement) {
                    styleElement.textContent = css;
                }
            }, templateData.css);

            await setPageHeightToContent(page);

            pdfBuffer = await timeItAsync("pdf create", async () => await page.pdf({ format: 'A4', printBackground: true }));
            break;
        } catch (error) {
            if (error instanceof Error && error.name === 'TargetCloseError') {
                attempts++;
                console.error(`TargetCloseError occurred in template generation (attempt ${attempts}):`, error);
                if (attempts >= MAX_RETRIES) {
                    throw new Error('Failed to generate PDF from template after multiple attempts due to TargetCloseError');
                }
                // Reset instances to force recreation on next attempt
                pageInstance = null;
                browserInstance = null;
            } else {
                // For any other error, throw immediately
                throw error;
            }
        }
    }

    if (upload) {
        return await uploadToR2(pdfBuffer!);
    }

    return pdfBuffer!;
}
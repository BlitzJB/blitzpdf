import React from 'react';
import ReactDOMServer from 'react-dom/server';
import puppeteer from 'puppeteer';
import { buildTailwindCSS } from './cssBuilder';
import { evalComponent } from './componentEvaluator';

export async function generatePDF(componentString: string, data: Record<string, any>): Promise<void> {
    const PDFDocument = evalComponent(componentString);

    const html = ReactDOMServer.renderToString(
        React.createElement(PDFDocument, data)
    );

    const css = await buildTailwindCSS(html);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    await page.evaluate((css: string) => {
        const styleElement = document.getElementById('tailwind-css');
        if (styleElement) {
            styleElement.textContent = css;
        }
    }, css);

    await page.pdf({ path: 'react-tailwind-output.pdf', format: 'A4' });

    await browser.close();

    console.log('PDF generated successfully!');
}
import fs from 'fs';
import path from 'path';
import { generatePDF } from './services/pdfGenerator';

const componentString = fs.readFileSync(path.join(__dirname, '..', 'assets', 'PDFDocument.js'), 'utf-8');

const data = {
    title: "Welcome to Our Dynamic PDF",
    content: "This PDF is generated with a dynamically loaded React component and Tailwind CSS.",
    items: ["Dynamic Item 1", "Dynamic Item 2", "Dynamic Item 3"]
};

generatePDF(componentString, data).then((url) => {
    console.log('PDF URL:', url);
})
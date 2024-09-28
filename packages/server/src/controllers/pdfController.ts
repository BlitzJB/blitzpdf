import { Request, Response } from 'express';
import { generatePDF } from '../services/pdfGenerator';

export const createPDF = async (req: Request, res: Response) => {
    const { componentString, data, tailwindConfig, upload, filename } = req.body;
    const result = await generatePDF(componentString, data, tailwindConfig, upload);
    
    if (typeof result === 'string') {
        // If result is a string, it's the URL of the uploaded PDF
        res.status(200).json({ data: { url: result }, success: true });
    } else {
        // If result is a Buffer, send it as a downloadable PDF
        res.setHeader('Content-Type', 'application/pdf');
        
        let pdfFilename = 'generated.pdf';
        if (filename) {
            pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        }
        
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFilename}`);
        res.status(200).send(result);
    }
};
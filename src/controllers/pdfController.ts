import { Request, Response } from 'express';
import { generatePDF } from '../services/pdfGenerator';

export const createPDF = async (req: Request, res: Response) => {
    const { componentString, data, tailwindConfig } = req.body;
    const url = await generatePDF(componentString, data, tailwindConfig);
    res.status(200).json({ data: { url }, success: true });
};
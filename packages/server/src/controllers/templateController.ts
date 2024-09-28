import { Request, Response } from 'express';
import { generatePDFFromTemplate } from '../services/pdfGenerator';
import * as templateService from '../services/templateService';

export const generateFromTemplate = async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const { data: encodedData, upload } = req.query;

  try {
    if (typeof encodedData !== 'string') {
      throw new Error('Data parameter is required and must be a string');
    }

    const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
    const result = await generatePDFFromTemplate(templateId, decodedData, upload === 'true');

    if (typeof result === 'string') {
      // If result is a string, it's the URL of the uploaded PDF
      res.status(200).json({ data: { url: result }, success: true });
    } else {
      // If result is a Buffer, send it as a downloadable PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${templateId}.pdf`);
      res.status(200).send(result);
    }
  } catch (error) {
    console.error('Error generating PDF from template:', error);
    res.status(500).json({ error: 'Failed to generate PDF from template', success: false });
  }
};

export async function getAllTemplates(req: Request, res: Response) {
  try {
    const templates = await templateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

export async function getTemplateContent(req: Request, res: Response) {
  const { templateId } = req.params;
  try {
    const content = await templateService.getTemplateContent(templateId);
    res.json({ content });
  } catch (error) {
    res.status(404).json({ error: 'Template not found' });
  }
}

export async function updateTemplateContent(req: Request, res: Response) {
  const { templateId } = req.params;
  const { content } = req.body;
  try {
    await templateService.updateTemplateContent(templateId, content);
    res.json({ message: 'Template updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template' });
  }
}
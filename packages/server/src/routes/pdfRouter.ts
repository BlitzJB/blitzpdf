import express from 'express';
import { createPDF } from '../controllers/pdfController';
import { generateFromTemplate } from '../controllers/templateController';
import asyncHandler from '../utils/asyncHandler';
import * as templateController from '../controllers/templateController';

const router = express.Router();

/**
 * @swagger
 * /api/pdf:
 *   post:
 *     summary: Generate a PDF from a React component
 *     tags: [PDF]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - componentString
 *               - data
 *             properties:
 *               componentString:
 *                 type: string
 *                 description: The React component as a string
 *               data:
 *                 type: object
 *                 description: The data to be passed to the React component
 *               tailwindConfig:
 *                 type: object
 *                 description: Optional Tailwind configuration
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the generated PDF
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', asyncHandler(createPDF));
router.post('/generate/:templateId', asyncHandler(generateFromTemplate));

/**
 * @swagger
 * /api/pdf/generate/{templateId}:
 *   get:
 *     summary: Generate a PDF from a pre-prepared template
 *     tags: [PDF]
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the template to use
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *         description: Base64 encoded JSON data to be passed to the template
 *       - in: query
 *         name: upload
 *         schema:
 *           type: boolean
 *         description: Whether to upload the generated PDF
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the generated PDF (if uploaded)
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/generate/:templateId', asyncHandler(generateFromTemplate));

router.get('/templates', templateController.getAllTemplates);
router.get('/templates/:templateId', templateController.getTemplateContent);
router.put('/templates/:templateId', templateController.updateTemplateContent);

export default router;
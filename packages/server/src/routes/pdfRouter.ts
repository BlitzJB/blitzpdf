import express from 'express';
import { createPDF } from '../controllers/pdfController';
import asyncHandler from '../utils/asyncHandler';

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

export default router;
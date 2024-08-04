import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import pdfRoutes from "./routes/pdfRouter"
import { errorHandler } from './middleware/errorHandler';
import { specs } from './config/swagger';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/pdf', pdfRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
import express from 'express';
import httpContext from 'express-http-context';
import { errorLogger, logger as requestLogger } from 'express-winston';
import swaggerUi from 'swagger-ui-express';
import deductPatient from './api/deductPatient';
import healthCheck from './api/health';
import { options } from './config/logging';
import swaggerDocument from './swagger.json';

const app = express();

app.use(httpContext.middleware);
app.use(requestLogger(options));

app.use('/health', healthCheck);
app.use('/deduct-patient', deductPatient);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorLogger(options));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

export default app;

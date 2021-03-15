import express from 'express';
import { errorLogger, logger as requestLogger } from 'express-winston';
import swaggerUi from 'swagger-ui-express';
import { deductionRequests } from './api/deduction-requests';
import healthCheck from './api/health';
import { options } from './config/logging';
import swaggerDocument from './swagger.json';
import * as logging from './middleware/logging';

const app = express();
app.use(express.json());
app.use(requestLogger(options));

app.use('/health', logging.middleware, healthCheck);
app.use('/deduction-requests', logging.middleware, deductionRequests);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorLogger(options));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

export default app;

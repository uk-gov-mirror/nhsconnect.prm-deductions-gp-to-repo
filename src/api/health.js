import express from 'express';
import * as config from '../config';
const router = express.Router();

export const message = {
  version: '1',
  description: 'Health of Deductions GP to Repo Component',
  status: 'running'
};

const { nodeEnv } = config.default;

router.get('/', (req, res) => {
  res.json({ ...message, nodeEnv });
});

export default router;

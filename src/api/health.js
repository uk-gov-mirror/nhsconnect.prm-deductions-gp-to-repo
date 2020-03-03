import express from 'express';
import config from '../config';
const router = express.Router();

export const message = {
  version: '1',
  description: 'Health of Deductions GP to Repo Component',
  status: 'running'
};

router.get('/', (req, res) => {
  res.json({ ...message, node_env: config.nodeEnv, example: process.env.GP2GP_AUTHORIZATION_KEYS });
});

export default router;

import express from 'express';
import { param } from 'express-validator';
import { authenticateRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { sendHealthRecordRequest } from '../services/gp2gp';

const router = express.Router();

const validationRules = [
  param('nhsNumber')
    .isNumeric()
    .withMessage(`'nhsNumber' provided is not numeric`),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 digits")
];

router.post('/:nhsNumber', authenticateRequest, validationRules, validate, async (req, res) => {
  try {
    await sendHealthRecordRequest(req.params.nhsNumber);
    res.sendStatus(200);
  } catch (error) {
    res.status(503).send(error.data);
  }
});

export default router;

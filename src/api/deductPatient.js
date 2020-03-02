import express from 'express';
import { param } from 'express-validator';
import { checkIsAuthenticated } from '../middleware/auth';
import { validate } from '../middleware/validation';
// import logger from '../config/logging';
const router = express.Router();

const validationRules = [
  param('nhsNumber')
    .isNumeric()
    .withMessage("'nhsNumber' provided is not numeric"),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 characters")
];

router.get('/:nhsNumber', checkIsAuthenticated, validationRules, validate, (req, res) => {
  res.sendStatus(200).send('hello world authenticated');
});

export default router;

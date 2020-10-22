import { param } from 'express-validator';
import { updateLogEventWithError } from '../../middleware/logging';
import { sendHealthRecordRequest } from '../../services/gp2gp';

export const healthRecordValidationRules = [
  param('nhsNumber').isNumeric().withMessage(`'nhsNumber' provided is not numeric`),
  param('nhsNumber')
    .isLength({ min: 10, max: 10 })
    .withMessage("'nhsNumber' provided is not 10 digits")
];

export const healthRecordRequest = async (req, res) => {
  try {
    await sendHealthRecordRequest(req.params.nhsNumber);
    res.sendStatus(200);
  } catch (error) {
    updateLogEventWithError(error);
    res.status(503).send(error.data);
  }
};

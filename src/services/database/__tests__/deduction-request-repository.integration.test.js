import ModelFactory from '../../../models';
import {
  getDeductionRequestByConversationId,
  updateDeductionRequestStatus
} from '../../database/deduction-request-repository';

describe('Deduction request repository', () => {
  const DeductionRequest = ModelFactory.getByName('DeductionRequest');

  afterAll(async () => {
    await DeductionRequest.sequelize.sync({ force: true });
    await ModelFactory.sequelize.close();
  });

  it('should retrieve DeductionRequest via conversation id', async () => {
    const conversationId = '22a748b2-fef6-412d-b93a-4f6c68f0f8dd';

    const expectedNhsNumber = '1234567890';
    const expectedStatus = 'pds_update_sent';
    await DeductionRequest.create({
      conversation_id: conversationId,
      nhs_number: expectedNhsNumber,
      status: expectedStatus,
      ods_code: 'A12345'
    });

    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    expect(deductionRequest.nhs_number).toBe(expectedNhsNumber);
    expect(deductionRequest.status).toBe(expectedStatus);
  });

  it('should return null when cannot find a deduction request', async () => {
    const nonExistentConversationId = 'dabcb112-e14c-46a6-b1eb-aad7acfc7bdf';
    const deductionRequest = await getDeductionRequestByConversationId(nonExistentConversationId);
    expect(deductionRequest).toBe(null);
  });

  it('should change deduction request status to pds_updated', async () => {
    const conversationId = 'e30d008e-0134-479c-bf59-6d4978227617';
    const expectedNhsNumber = '1234567890';
    const expectedStatus = 'pds_updated';

    await DeductionRequest.create({
      conversation_id: conversationId,
      nhs_number: expectedNhsNumber,
      status: 'started',
      ods_code: 'A12345'
    });
    await updateDeductionRequestStatus(conversationId, expectedStatus);

    const deductionRequest = await DeductionRequest.findByPk(conversationId);

    expect(deductionRequest.status).toBe(expectedStatus);
  });
});

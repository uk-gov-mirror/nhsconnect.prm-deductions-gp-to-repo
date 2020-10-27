import ModelFactory from '../../models';
import { getDeductionRequestByConversationId } from '../database/deduction-request-repository';

describe('Deduction request repository', () => {
  const DeductionRequests = ModelFactory.getByName('DeductionRequests');
  // let transaction;
  // ModelFactory.sequelize.transaction().then(t => (transaction = t));

  const conversationId = '22a748b2-fef6-412d-b93a-4f6c68f0f8dd';
  beforeAll(async () => {
    await ModelFactory.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // await transaction.rollback();
    await ModelFactory.sequelize.close();
  });

  it('should retrieve DeductionRequest via conversation id', async () => {
    const expectedNhsNumber = '1234567890';
    // try {
    await DeductionRequests.create(
      {
        conversation_id: conversationId,
        nhs_number: expectedNhsNumber,
        status: 'pds_update_sent',
        ods_code: 'something'
      }
      // { transaction }
    );
    // await transaction.commit();
    // }

    //   console.log(err);
    const deductionRequest = await getDeductionRequestByConversationId(conversationId);
    expect(deductionRequest.nhsNumber).toBe(expectedNhsNumber);
  });
});

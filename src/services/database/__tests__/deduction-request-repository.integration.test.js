import ModelFactory from '../../../models';
import { deductionRequestModelName } from "../../../models/DeductionRequest";
import { getDeductionRequestByConversationId } from '../deduction-request-repository';

describe('Deduction request repository', () => {
   const DeductionRequest = ModelFactory.getByName(deductionRequestModelName);
   const conversationId = '22a748b2-fef6-412d-b93a-4f6c68f0f8dd';

   afterAll(async () => {
     await DeductionRequest.sequelize.sync({ force: true });
     await ModelFactory.sequelize.close();
   });

   it('should retrieve DeductionRequest via conversation id', async () => {
     const expectedNhsNumber = '1234567890';
     await DeductionRequest.create({
       conversation_id: conversationId,
       nhs_number: expectedNhsNumber,
       status: 'pds_update_sent',
       ods_code: 'something'
     });

     const deductionRequest = await getDeductionRequestByConversationId(conversationId);
     expect(deductionRequest.nhsNumber).toBe(expectedNhsNumber);
   });
});

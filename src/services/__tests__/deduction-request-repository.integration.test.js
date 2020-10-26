import ModelFactory from '../../models';
import {getDeductionRequestByConversationId} from "../database/deduction-request-repository";

describe("Deduction request repository", () => {

    const DeductionRequests = ModelFactory.getByName('DeductionRequests')

    beforeAll(async() => {
        DeductionRequests.destroy({where: {status: "pds_update_sent"}});
    })
    afterAll(() => {
        DeductionRequests.destroy({where: {status: "pds_update_sent"}});
        ModelFactory.sequelize.close();
    });

    it("should retrieve DeductionRequest via conversation id", async () => {
        const expectedNhsNumber = "1234567890";
        const conversationId = "10297bfb-35de-4fcd-b4e3-3cbf720f8424";

        await DeductionRequests.create(
            {
                conversation_id: conversationId,
                nhs_number: expectedNhsNumber,
                status: "pds_update_sent",
                ods_code: "something"
            }
        )

        const deductionRequest = await getDeductionRequestByConversationId(conversationId)

        expect(deductionRequest.nhs_number).toBe(expectedNhsNumber)
    })
})
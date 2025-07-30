import { createTool } from "../../../utils/tool-helpers.js";
import { z } from "zod";

const getOrderByIdParamsSchema = z.object({
    orderId: z.string().uuid().describe("The ID of the order to retrieve."),
});

const getOrderByIdTool = createTool(
    'Get Order By Id',
    `Retrieves an order by its ID.`,
    getOrderByIdParamsSchema.shape,
    async ({ orderId }) => {
        
        return {
            content: [
                {
                    type: "text" as const,
                    text: '',
                },
            ],
        };
    }
);

export default getOrderByIdTool;
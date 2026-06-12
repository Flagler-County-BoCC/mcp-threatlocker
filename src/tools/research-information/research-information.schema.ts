import { z } from 'zod';

export const ResearchInformationGetAllCategoriesSchema = z.object({
  getStoreCategories: z.coerce.boolean().optional(),
});

export type ResearchInformationGetAllCategoriesInput = z.infer<
  typeof ResearchInformationGetAllCategoriesSchema
>;

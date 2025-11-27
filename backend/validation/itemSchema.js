import { z } from "zod";

const itemSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1).trim(),
  position: z.coerce.number(),
  completed: z.coerce.boolean().transform(v => v ? 1 : 0)
});

// id is not allowed in the body, and all other fields are required (except when optional) when creating an item
export const createItemSchema = itemSchema
  .omit({ id: true });

// id is part of params, all other fields are optional in the body when updating an item
export const updateItemSchema = itemSchema
  .omit({ id: true })
  .partial()

export const paramsSchema = itemSchema
  .pick({ id: true })

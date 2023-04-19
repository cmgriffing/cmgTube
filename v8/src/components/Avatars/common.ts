import { z, AnyZodObject, ZodDefault } from "zod";

export function createZodAsset(
  config: AnyZodObject | ZodDefault<AnyZodObject> = z.object({})
) {
  return z.object({
    value: z.string(),
    config,
  });
}

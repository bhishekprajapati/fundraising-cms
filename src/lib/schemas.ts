import { z } from 'zod'
import { Amount } from './amount'

export const amountSchema = z
  .number()
  .refine((v) => !Number.isNaN(Amount.from(v)))
  .transform((v) => new Amount(v))

export const campaignIdSchema = z.number().gte(0).int().max(Number.MAX_SAFE_INTEGER)
export const referralIdSchema = z.string().trim().max(64)
export const donorSchema = z.object({
  name: z.string().trim().toLowerCase().nonempty().min(2).max(64),
  email: z.email().optional(),
})

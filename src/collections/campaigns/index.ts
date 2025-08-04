import { isAdmin } from '@/access'
import { authenticated } from '@/access/authenticated'
import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'
import { z } from 'zod'

const goalAmountSchema = z
  .number()
  .int({
    error: 'Amount must not have fractional value',
  })
  .gt(0, {
    error: 'Amount must be greater than 0 INR',
  })
  .lte(Number.MAX_SAFE_INTEGER, {
    error: `Amount must not exceed than ${Number.MAX_SAFE_INTEGER} INR`,
  })

export const CampaignCollectionConfig: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    defaultColumns: ['id', 'name', 'status', 'createdAt', 'updatedAt'],
    useAsTitle: 'name',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    update: isAdmin,
    read: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 128,
      minLength: 16,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 2000,
      required: true,
    },
    {
      name: 'cover',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'goal',
      label: 'Goal Amount',
      type: 'number',
      required: true,
      validate: (value: unknown) => {
        const result = goalAmountSchema.safeParse(value)
        return result.success || result.error.issues[0].message
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'running',
          value: 'running',
        },
        {
          label: 'paused',
          value: 'paused',
        },
      ],
      defaultValue: 'paused',
    },
    ...slugField('name', {
      slugOverrides: {
        required: true,
      },
    }),
  ],
  timestamps: true,
}

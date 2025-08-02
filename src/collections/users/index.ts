import type { CollectionConfig } from 'payload'
import { z } from 'zod'
import { isAdmin, isAdminFieldLevel, isAdminOrSelf } from '@/access'
import { authenticated } from '@/access/authenticated'

const userSchema = z
  .string({
    error: 'Must be a string',
  })
  .min(12, {
    error: 'Minimum 12 characters need',
  })
  .max(24, {
    error: 'Maximum 24 characters are allowed',
  })
  .regex(/^[a-z0-9_]+$/, {
    error: 'Only lowercase letters, numbers, and underscores are allowed',
  })

const ROLE_ADMIN = 'admin'
const ROLE_INTERN = 'volunteer'

export const UserCollectionConfig: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['username', 'firstName', 'role'],
    useAsTitle: 'firstName',
  },
  auth: true,
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 64,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      defaultValue: '',
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'username',
      type: 'text',
      unique: true,
      required: true,
      index: true,
      saveToJWT: true,
      validate: (value: unknown) => {
        const result = userSchema.safeParse(value)
        return result.success || result.error.issues[0].message
      },
      access: {
        update: () => false, // disbale for all
      },
    },
    {
      name: 'role',
      type: 'select',
      saveToJWT: true,
      options: [
        {
          label: 'Admin',
          value: ROLE_ADMIN,
        },
        {
          label: 'Volunteer',
          value: ROLE_INTERN,
        },
      ],
      defaultValue: ROLE_INTERN,
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
  ],
  timestamps: true,
}

import type { Access, AccessArgs, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export const isAdmin = ({ req }: AccessArgs<User>): boolean => {
  return req.user ? req.user.role === 'admin' : false
}

export const isAdminOrSelf: Access = ({ req }) => {
  const { user } = req

  if (user) {
    if (user.role === 'admin') {
      return true
    }

    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}

export const isAdminFieldLevel: FieldAccess<{ id: string }> = ({ req }) => {
  return req.user ? req.user.role === 'admin' : false
}

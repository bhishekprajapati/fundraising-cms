import { getPayload } from 'payload'
import config from '@payload-config'

export const $local = await getPayload({ config })

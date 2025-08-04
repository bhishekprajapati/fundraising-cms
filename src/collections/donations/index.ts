import { systemOnly } from '@/access'
import { Amount } from '@/lib/amount'
import { api } from '@/lib/api'
import {
  createDonationOrder,
  TRazorpayWebhookAllPaymentEvent,
  validateRazorpayWebhookSignature,
} from '@/lib/razorpay'
import { amountSchema, campaignIdSchema, donorSchema, referralIdSchema } from '@/lib/schemas'
import type { CollectionConfig, PayloadHandler } from 'payload'
import { z } from 'zod'

function makeInitFlowHandler() {
  const jsonSchema = z.object({
    campaignId: campaignIdSchema,
    referralId: referralIdSchema,
    amount: amountSchema,
    donor: donorSchema,
  })

  const handle: PayloadHandler = async (req) => {
    if (!req.json) return api.err()
    try {
      const json = await req.json()
      const params = await jsonSchema.parseAsync(json)
      const { id, status } = await createDonationOrder(params)
      return api.data({
        id,
        status,
      })
    } catch (err) {
      console.error(err)
      return api.err()
    }
  }

  return handle
}

function makeDonationCaptureHandler() {
  const handle: PayloadHandler = async (req) => {
    const signature = req.headers.get('X-Razorpay-Signature')
    const eventId = req.headers.get('x-razorpay-event-id')
    if (!signature || !req.text) return api.err()

    const { payload } = req
    let rawBody: string | undefined

    try {
      const body = await req.text()
      const isAuthentic = validateRazorpayWebhookSignature(signature, body)

      if (!isAuthentic) {
        return api.err({
          name: 'forbidden',
          message: 'not allowed',
          init: {
            status: 403,
          },
        })
      }

      rawBody = body
    } catch (err) {
      console.error(err)
      return api.err()
    }

    const transactionID = await payload.db.beginTransaction({
      accessMode: 'read write',
      isolationLevel: 'serializable',
    })

    try {
      const json = JSON.parse(rawBody) as TRazorpayWebhookAllPaymentEvent
      const payment = json.payload?.payment
      if (!payment || !payment.entity.notes.campaignId) return api.err()

      // @ts-expect-error ...
      if (json['event'] === 'payment.authorized') {
        return api.data({})
      }

      const users = await payload.find({
        collection: 'users',
        where: {
          username: {
            equals: payment.entity.notes.referralId,
          },
        },
        // @ts-expect-error ...
        req: { transactionID },
      })

      const referrer = users.docs.at(0)

      const data = {
        eventId,
        accountId: json.account_id,
        campaign: json.payload.payment.entity.notes.campaignId,
        orderId: payment.entity.order_id,
        referrer: referrer?.id,
        amount: payment.entity.amount,
        status: payment.entity.status,
        currency: payment.entity.currency,
        email: payment.entity.email,
        contact: payment.entity.contact,
        method: payment.entity.method,
      } as const

      await payload.create({
        collection: 'donations',
        // @ts-expect-error ...
        data,
        // @ts-expect-error ...
        req: { transactionID },
      })

      // @ts-expect-error ...
      await payload.db.commitTransaction(transactionID)
      return api.data({})
    } catch (err) {
      console.error(err)
      // @ts-expect-error god knows why
      await payload.db.rollbackTransaction(transactionID)
    }
    return api.err()
  }

  return handle
}

export const DonationCollectionConfig: CollectionConfig = {
  slug: 'donations',
  admin: {
    defaultColumns: ['campaign', 'orderId', 'amount', 'referrer', 'method'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) {
        if (req.user.role === 'admin') {
          return true
        }
        return {
          referrer: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    create: systemOnly,
    update: systemOnly,
    delete: systemOnly,
  },
  fields: [
    {
      name: 'accountId',
      type: 'text',
      required: true,
      hidden: true,
    },
    {
      name: 'eventId',
      type: 'text',
      unique: true,
      index: true,
      required: true,
      hidden: true,
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      required: true,
    },
    {
      name: 'orderId',
      label: 'Donation Id',
      type: 'text',
      unique: true,
      index: true,
      required: true,
    },
    {
      name: 'referrer',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
    },
    {
      name: 'amount',
      type: 'number',
      min: Amount.MIN_SAFE_AMOUNT,
      max: Amount.MAX_SAFE_AMOUNT,
      required: true,
      admin: {
        components: {
          Cell: '@/components/table/cell/amount',
        },
      },
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        {
          label: 'INR',
          value: 'INR',
        },
      ],
      defaultValue: 'INR',
      hidden: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'failed',
          value: 'failed',
        },
        {
          label: 'captured',
          value: 'captured',
        },
        {
          label: 'authorized',
          value: 'authorized',
        },
      ],
      required: true,
    },
    {
      name: 'method',
      type: 'select',
      options: [
        {
          label: 'upi',
          value: 'upi',
        },
        {
          label: 'card',
          value: 'card',
        },
        {
          label: 'wallet',
          value: 'wallet',
        },
        {
          label: 'netbanking',
          value: 'netbanking',
        },
      ],
      required: true,
      admin: {
        components: {
          Cell: '@/components/table/cell/payment-method',
        },
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'contact',
      type: 'text',
    },
  ],
  endpoints: [
    {
      path: '/init-flow',
      method: 'post',
      handler: makeInitFlowHandler(),
    },
    {
      path: '/capture',
      method: 'post',
      handler: makeDonationCaptureHandler(),
    },
  ],
  timestamps: true,
}

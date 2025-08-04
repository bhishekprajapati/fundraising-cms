import Razorpay from 'razorpay'
import { Amount } from './amount'
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils'
export type { RazorpayWebhook } from 'razorpay/dist/utils/razorpay-utils'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

type TCreateDonationOrderParams = {
  campaignId: number
  referralId: string
  amount: Amount
  donor: {
    name: string
    email?: string
  }
}

export async function createDonationOrder(params: TCreateDonationOrderParams) {
  const { amount, campaignId, referralId } = params

  const order = await razorpay.orders.create({
    receipt: `${campaignId}-${referralId}`,
    currency: amount.getCurrency(),
    amount: amount.value,
    notes: {
      campaignId,
      referralId,
    },
  })

  return order
}

export function validateRazorpayWebhookSignature(signature: string, body: string) {
  if (process.env.RAZORPAY_WEBHOOK_SECRET === undefined) {
    throw Error('Razorpay secret not set')
  }
  return validateWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET)
}

export type TRazorpayWebhookEvent<TPayload> = {
  entity: 'event'
  account_id: string
  contains: Array<'payment'>
  payload: TPayload
  created_at: number
}

export type TRazorpayWebhookPaymentEvent<TEntity> = TRazorpayWebhookEvent<{
  payment: { entity: TEntity }
}>

type TBasePaymentEntity = {
  id: string
  entity: 'payment'
  amount: number
  currency: string
  status: 'failed' | 'captured' | 'authorized'
  order_id: string
  invoice_id: string | null
  international: boolean
  method: 'upi' | 'wallet' | 'card' | 'netbanking'
  amount_refunded: number
  refund_status: string | null
  captured: boolean
  description: string | null
  card_id: string | null
  bank: string | null
  wallet: string | null
  vpa: string | null
  email: string
  contact: string
  notes: {
    campaignId?: string
    referralId?: string
  }
  fee: number | null
  tax: number | null
  error_code: string | null
  error_description: string | null
  error_source: string | null
  error_step: string | null
  error_reason: string | null
  created_at: number
  acquirer_data: Record<string, unknown>
}

export type TRazorpayWebhookEventMap = {
  payment: {
    'payment.authorized': {
      upi: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          upi: {
            payer_account_type: string
            vpa: string
            flow: string
          }
        }
      >

      wallet: TRazorpayWebhookPaymentEvent<TBasePaymentEntity>

      card: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          card: {
            emi: boolean
            entity: 'card'
            id: string
            iin: string
            international: boolean
            issuer: string | null
            last4: string
            name: string
            network: string
            sub_type: string
            type: string
          }
          token_id: string
        }
      >

      netbanking: TRazorpayWebhookPaymentEvent<TBasePaymentEntity>
    }

    'payment.captured': {
      upi: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          base_amount: number
          method: 'upi'
          vpa: string
          upi: {
            payer_account_type: string
            vpa: string
            flow: string
          }
        }
      >

      wallet: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          base_amount: number
          method: 'wallet'
          wallet: string // e.g., 'payzapp'
        }
      >

      card: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          method: 'card'
          card_id: string
          token_id: string
          card: {
            emi: boolean
            entity: 'card'
            id: string
            iin: string
            international: boolean
            issuer: string | null
            last4: string
            name: string
            network: string
            sub_type: string
            type: string
          }
        }
      >

      netbanking: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          base_amount: number
          method: 'netbanking'
          bank: string
        }
      >
    }

    'payment.failed': {
      upi: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          method: 'upi'
          upi: {
            payer_account_type: string
            vpa: string
            flow: string
          }
        }
      >

      wallet: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          method: 'wallet'
          wallet: string
          acquirer_data: {
            transaction_id: string | null
          }
        }
      >

      card: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          method: 'card'
          card_id: string
          token_id?: string
          card: {
            emi: boolean
            entity: 'card'
            id: string
            iin: string
            international: boolean
            issuer: string | null
            last4: string
            name: string
            network: string
            sub_type: string
            type: string
          }
          acquirer_data: {
            auth_code: string
            rrn: string
          }
        }
      >

      netbanking: TRazorpayWebhookPaymentEvent<
        TBasePaymentEntity & {
          method: 'netbanking'
          bank: string
          acquirer_data: {
            bank_transaction_id: string | null
          }
        }
      >
    }
  }
}

type RecordToUnion<T> = {
  [K in keyof T]: T[K]
}[keyof T]

export type TRazorpayWebhookAllPaymentEvent =
  | RecordToUnion<TRazorpayWebhookEventMap['payment']['payment.authorized']>
  | RecordToUnion<TRazorpayWebhookEventMap['payment']['payment.captured']>
  | RecordToUnion<TRazorpayWebhookEventMap['payment']['payment.failed']>

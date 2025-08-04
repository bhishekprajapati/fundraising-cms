'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { campaignIdSchema, referralIdSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

function withCurrencySymbol(value: number) {
  const INR_SYMBOL = '₹'
  return INR_SYMBOL + value.toString()
}

const amountPreset = [50, 100, 250] as const

type TFormSchema = z.infer<typeof formSchema>
type TPaymentSucessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}
type TPaymentFailureResponse = unknown

const formSchema = z.object({
  name: z.string().trim().nonempty().max(64),
  email: z.email(),
  amount: z
    .number()
    .int()
    .min(1)
    .max(Number.MAX_SAFE_INTEGER / 10_000),
  campaignId: campaignIdSchema,
  referralId: referralIdSchema,
})

const resolvedFormSchema = zodResolver(formSchema)

type TDonateFormProps = {
  campaignId: number
  referralId: string
}

export function DonateForm(props: TDonateFormProps) {
  const { campaignId, referralId } = props
  const [razorpayStatus, setRazorpayStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  const form = useForm<TFormSchema>({
    mode: 'onChange',
    resolver: resolvedFormSchema,
    defaultValues: {
      campaignId,
      referralId,
      amount: amountPreset[1],
    },
  })

  const watchedAmount = useWatch({
    control: form.control,
    name: 'amount',
  })

  useEffect(() => {
    if ('Razorpay' in window) return
    const script = document.createElement('script')
    script.onload = () => setRazorpayStatus('loaded')
    script.onerror = () => setRazorpayStatus('error')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  async function handleSubmit(values: TFormSchema) {
    const { name, email, campaignId, referralId } = values
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const currency = 'INR'
    const amount = values.amount * 100

    try {
      const res = await fetch('/api/donations/init-flow', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({
          amount,
          campaignId,
          referralId,
          donor: {
            name,
            email,
          },
        }),
      })

      if (res.ok) {
        const result = await res.json()

        if (result.ok) {
          const order = result.data
          const payment = new Razorpay({
            key,
            amount,
            currency,
            order_id: order.id,
            name: 'She can foundation',
            // callback_url: ""
          })

          payment.on('payment.failed', (err: TPaymentFailureResponse) => {
            console.error(err)
          })

          payment.on('payment.success', (data: TPaymentSucessResponse) => {
            console.log(data)
            form.reset()
          })

          payment.open()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormLabel>Amount</FormLabel>
        <div className="grid grid-cols-[repeat(3,1fr)_3fr] gap-4">
          {amountPreset.map((amount) => (
            <Button
              key={amount}
              variant={watchedAmount === amount ? 'default' : 'outline'}
              onClick={() => form.setValue('amount', amount)}
            >
              {withCurrencySymbol(amount)}
            </Button>
          ))}

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input pattern="[d]" placeholder={withCurrencySymbol(500)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={razorpayStatus !== 'loaded' || !form.formState.isValid}>
          Donate
        </Button>
      </form>
    </Form>
  )
}

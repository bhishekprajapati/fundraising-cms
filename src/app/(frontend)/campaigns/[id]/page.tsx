import { Logo } from '@/components/brand'
import { Media } from '@/components/Media'
import { $local } from '@/lib/local'
import { Lock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { DonateForm } from '../components/donate-form'

type TProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function page(props: TProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const ref =
    typeof searchParams['ref'] === 'string' && searchParams['ref'].length > 0
      ? searchParams['ref']
      : undefined

  try {
    const campaign = await $local.findByID({
      collection: 'campaigns',
      id: params.id,
      depth: 1,
    })

    if (campaign.status !== 'running') {
      notFound()
    }

    return (
      <div className="p-4 my-12 md:my-24">
        <div className="relative mx-auto max-w-xl bg-zinc-950 p-4 rounded-xl">
          <article className=" flex flex-col gap-4">
            <header>
              <Media
                resource={campaign.cover}
                className="h-60"
                pictureClassName="h-full"
                imgClassName="h-full object-cover object-top rounded-lg"
              />
            </header>
            <div>
              <h1 className="text-xl font-medium mb-1">{campaign.name}</h1>
              <p className="text-opacity-75 text-justify">{campaign.description}</p>
            </div>
            <DonateForm campaignId={campaign.id} referralId={ref ?? ''} />
            <p className="text-green-400 flex gap-2 items-center text-sm justify-center">
              <Lock size={12} />
              Your payment is encrypted and secured by razorpay.
            </p>
          </article>
          <span className="inline-block absolute top-0 left-[50%] -translate-x-[50%] -translate-y-[50%] p-4 bg-zinc-950 rounded-full">
            <Logo size={72} className="rounded-full" />
          </span>
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}

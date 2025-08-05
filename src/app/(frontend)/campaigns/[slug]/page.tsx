import { Logo } from '@/components/brand'
import { Media } from '@/components/Media'
import { $local } from '@/lib/local'
import { ExternalLink, Instagram, Lock, LucideIcon, MapPin } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DonateForm } from '../components/donate-form'
import Link from 'next/link'
import { TButtonVariants, buttonVariants } from '@/components/ui/button'

type TSocialLinkProps = React.ComponentProps<typeof Link> & { Icon: LucideIcon } & TButtonVariants

function SocialLink(props: TSocialLinkProps) {
  const { children, Icon, className, size, variant, ...rest } = props
  return (
    <Link
      className={buttonVariants({ className, size, variant })}
      {...rest}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon size={16} /> {children}
    </Link>
  )
}

async function getCampaignBySlug(slug: string) {
  try {
    const res = await $local.find({
      collection: 'campaigns',
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
            status: {
              equals: 'running',
            },
          },
        ],
      },
      depth: 1,
    })
    return res.docs.at(0)
  } catch (err) {
    console.log(err)
    return undefined
  }
}

type TProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function page(props: TProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  const ref =
    typeof searchParams['ref'] === 'string' && searchParams['ref'].length > 0
      ? searchParams['ref']
      : undefined

  const campaign = await getCampaignBySlug(params.slug)
  if (!campaign) notFound()

  return (
    <div className="p-4 my-12 md:my-24">
      <div className="relative mx-auto max-w-xl bg-card rounded-2xl">
        <article className=" flex flex-col gap-4">
          <div className="pt-4 px-4">
            <div className="relative rounded-xl overflow-hidden">
              <Media
                resource={campaign.cover}
                className="h-[20rem]"
                pictureClassName="h-full"
                imgClassName="h-full object-cover object-top rounded-lg"
              />
              <div className="pointer-events-none hidden bg-gradient-to-t from-black sm:absolute sm:bottom-0 sm:left-0 sm:block sm:h-[90%] sm:w-full"></div>
              <div className="relative sm:absolute sm:bottom-0 sm:left-0 sm:mb-0 sm:w-full">
                <div className="flex flex-col gap-4 mt-4 sm:p-4">
                  <h1 className="text-3xl font-semibold sm:text-5xl">{campaign.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex gap-2 items-center">
                      <MapPin size={16} />
                      Delhi
                    </span>
                    <span className="ms-auto" />
                    <SocialLink
                      href="https://www.instagram.com/_shecanfoundation_"
                      Icon={Instagram}
                      variant="ghost"
                      size="icon"
                    />
                    <SocialLink
                      href="https://shecanfoundation.org/"
                      Icon={ExternalLink}
                      variant="ghost"
                      size="icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-opacity-75 sm:text-justify px-4 leading-normal">
            {campaign.description}
          </p>
          <div className="text-center">
            <span className="inline-block w-full border-b border-b-border" />
          </div>
          <div className="px-4">
            <DonateForm campaignId={campaign.id} referralId={ref ?? ''} />
          </div>
          <p className="text-green-400 flex gap-2 items-center text-xs justify-center px-4 pb-4">
            <Lock size={9} />
            Your payment is encrypted and secured by razorpay.
          </p>
        </article>
        <span className="inline-block absolute top-0 left-[50%] -translate-x-[50%] -translate-y-[50%] p-4 bg-zinc-950 rounded-full">
          <Logo size={72} className="rounded-full" />
        </span>
      </div>
    </div>
  )
}

export async function generateMetadata(props: TProps): Promise<Metadata> {
  const { slug } = await props.params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign) return {}

  return {
    title: `${campaign.name} | Campaign at She can foundation`,
    description: campaign.description,
  }
}

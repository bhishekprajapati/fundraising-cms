'use client'

import Image from 'next/image'

type TLogoProps = {
  size?: number
} & Pick<React.ComponentProps<'image'>, 'className' | 'style'>

export function Logo(props: TLogoProps) {
  const { size = 24, ...rest } = props
  return (
    <Image src="/logo.jpg" width={size} height={size} alt="she can foundation logo" {...rest} />
  )
}

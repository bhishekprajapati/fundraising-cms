import React from 'react'
import type { Payload } from 'payload'

type TReferralLink = {
  payload: Payload
}

async function ReferralLink(props: TReferralLink) {
  const { payload } = props
  return <button>referral button</button>
}

export default ReferralLink

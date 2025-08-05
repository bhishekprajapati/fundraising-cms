'use client'

import { Campaign } from '@/payload-types'
import { useAuth, useDocumentInfo } from '@payloadcms/ui'
import copy from 'copy-to-clipboard'
import { Copy, Link } from 'lucide-react'
import React from 'react'
import toast from 'react-hot-toast'
import './index.scss'
import canUseDOM from '@/utilities/canUseDOM'

function ReferralButton() {
  const user = useAuth()
  const doc = useDocumentInfo()
  const link = !canUseDOM ? undefined : generateLink()

  function generateLink() {
    const domain = window.location.origin
    const collection = doc.collectionSlug
    const slug = (doc.initialData as Campaign)['slug']
    const ref = user.user?.username
    const url = `${domain}/${collection}/${slug}?ref=${ref}`
    return url
  }

  function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (link) {
      copy(link)
      toast.success('Referral link copied')
    }
  }

  return link ? (
    <span className="referral">
      <Link className="referral-link-icon" size={16} />
      <span className="referral-link-text">{link}</span>
      <button className="referral-bttn" onClick={handleCopy}>
        <Copy size={12} className="referral-copy-icon" />
        Refer
      </button>
    </span>
  ) : null
}

export function CampaignReferralButton() {
  const doc = useDocumentInfo()
  return doc.isEditing ? <ReferralButton /> : null
}

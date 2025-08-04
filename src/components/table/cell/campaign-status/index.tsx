import { Campaign } from '@/payload-types'
import { DefaultServerCellComponentProps } from 'payload'
import './index.scss'

export default function CampaignStatusCell(props: DefaultServerCellComponentProps) {
  const status = props.cellData as Campaign['status']
  return (
    <span className="campaign-status-cell" data-status={status}>
      {status}
    </span>
  )
}

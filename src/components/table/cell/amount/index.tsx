import { DefaultServerCellComponentProps } from 'payload'
import { Amount } from '@/lib/amount'
import './index.scss'
import { Donation } from '@/payload-types'

export default function AmountCell(props: DefaultServerCellComponentProps) {
  const data = props.rowData as Donation
  const amount = new Amount(data.amount)
  return (
    <span className="amount-cell" data-status={data.status}>
      {amount.format()}
    </span>
  )
}

import { Donation } from '@/payload-types'
import { DefaultServerCellComponentProps } from 'payload'
import './index.scss'

export default function PaymentMethod(props: DefaultServerCellComponentProps) {
  const method = props.cellData as Donation['method']

  return (
    <span className="payment-method-cell" data-method={method}>
      {method}
    </span>
  )
}

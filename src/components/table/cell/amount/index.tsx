import { DefaultServerCellComponentProps } from 'payload'
import { Amount } from '@/lib/amount'
import './index.scss'

export default function AmountCell(props: DefaultServerCellComponentProps) {
  const amount = new Amount(props.cellData as number)
  return <span className="amount-cell">{amount.format()}</span>
}

import { User } from '@/payload-types'
import React from 'react'
import './index.scss'
import { Greet } from './greet'

const baseClass = 'before-dashboard'

type TProps = {
  user: User
}

const BeforeDashboard: React.FC<TProps> = (props) => {
  const { user } = props
  return <Greet name={user.firstName} />
}

export default BeforeDashboard

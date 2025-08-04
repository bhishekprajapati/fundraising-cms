'use client'

import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function Greet({ name }: { name: string }) {
  useEffect(() => {
    toast(`Welcome, ${name}!`, {
      icon: '👏',
    })
  }, [name])

  return null
}

'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </div>
  )
}

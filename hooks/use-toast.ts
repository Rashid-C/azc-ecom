'use client'

import { ReactNode } from 'react'
import { toast as sonnerToast } from 'sonner'

type ToastInput = {
  title?: ReactNode
  description?: ReactNode
  variant?: 'default' | 'destructive'
  action?: ReactNode
}

const showToast = ({ title, description, variant, action }: ToastInput) => {
  const message = title ?? description ?? ''
  const options: Record<string, unknown> = {}

  if (title && description) {
    options.description = description
  }

  if (action) {
    options.action = action as unknown
  }

  if (variant === 'destructive') {
    return sonnerToast.error(message as string, options)
  }

  return sonnerToast(message as string, options)
}

export function useToast() {
  return {
    toast: (input: ToastInput) => showToast(input),
  }
}


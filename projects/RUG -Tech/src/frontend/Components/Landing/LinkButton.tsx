'use client'

import Link from 'next/link'
import { Button, type ButtonProps } from '@/Components/ui'

type LinkButtonProps = Omit<ButtonProps, 'as' | 'href'> & {
  href: string
}

export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button as={Link} href={href} {...props} />
}


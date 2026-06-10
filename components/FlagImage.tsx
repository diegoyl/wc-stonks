'use client'

import Image from 'next/image'
import { useState } from 'react'
import { flagUrl } from '@/lib/format'

interface Props {
  code: string
  name: string
  size?: number
  className?: string
  outlined?: boolean
}

export default function FlagImage({ code, name, size = 24, className = '', outlined = false }: Props) {
  const [error, setError] = useState(false)

  const img = error ? (
    <span
      className={`inline-flex items-center justify-center bg-gray-200 text-gray-500 text-xs font-bold ${!outlined ? className : ''}`}
      style={{ width: size, height: Math.round(size * 0.67) }}
    >
      {code}
    </span>
  ) : (
    <Image
      src={flagUrl(code)}
      alt={`${name} flag`}
      width={size}
      height={Math.round(size * 0.67)}
      className={`object-cover block ${!outlined ? className : ''}`}
      style={{ imageRendering: 'pixelated' }}
      unoptimized
      onError={() => setError(true)}
    />
  )

  if (!outlined) return img

  return (
    <span
      className={`inline-flex bg-white/40 ${className}`}
      style={{ padding: 1.5 }}
    >
      {img}
    </span>
  )
}

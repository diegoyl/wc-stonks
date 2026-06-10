'use client'

import { useEffect, useRef } from 'react'
import { flagUrl } from '@/lib/format'

const STRIPS = 13

// size = width in px; height derived from 13:9 pixel-art ratio
export default function WavingFlagImage({ code, name, size }: {
  code: string
  name: string
  size: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)

  const flagW = size
  const flagH = Math.round(size * 9 / 13)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const strips = Array.from(container.children) as HTMLDivElement[]
    let start: number | null = null

    function animate(ts: number) {
      if (!start) start = ts
      const t = (ts - start) / 1000
      const pixelSize = flagW / STRIPS  // 1 source pixel in rendered px
      strips.forEach((el, i) => {
        const phase = (i / STRIPS) * Math.PI
        const ampPx = i <= 1 ? 0 : 0.6 + 0.4 * ((i - 2) / (STRIPS - 3))
        const y = Math.sin(t * 1.5 + phase) * ampPx * pixelSize
        const snapped = Math.round(y / pixelSize) * pixelSize
        el.style.transform = `translateY(${snapped}px)`
      })
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [flagH])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`${name} flag`}
      style={{ display: 'flex', width: flagW, height: flagH, overflow: 'visible', flexShrink: 0 }}
    >
      {Array.from({ length: STRIPS }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: '0 0 calc(100% / 13 + 1px)',
            marginRight: '-1px',
            height: flagH,
            backgroundImage: `url(${flagUrl(code)})`,
            backgroundSize: `${flagW}px ${flagH}px`,
            backgroundPosition: `${-(i * flagW / STRIPS)}px 0`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

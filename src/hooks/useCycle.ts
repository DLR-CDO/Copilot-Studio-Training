import { useEffect, useState } from 'react'

/**
 * Steps an index through `0..count-1` every `intervalMs` while `running` is true, so a
 * diagram highlight moves from box to box instead of sitting on one box.
 */
export function useCycle(count: number, intervalMs: number, running: boolean): number {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!running || count <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs, running])

  return index
}

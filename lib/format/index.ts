export function formatCoins(amount: number): string {
  return `${amount}¢`
}

export function flagUrl(code: string): string {
  return `/flags/${code}.png`
}

export function teamSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

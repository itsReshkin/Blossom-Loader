type ClassValue = string | number | false | null | undefined | ClassValue[]

function flatten(value: ClassValue, out: string[]): void {
  if (!value) return
  if (Array.isArray(value)) {
    for (const item of value) flatten(item, out)
    return
  }
  out.push(String(value))
}

export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  flatten(values, out)
  return out.join(' ')
}

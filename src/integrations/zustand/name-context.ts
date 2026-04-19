// Shared name context: middleware sets this, create reads and clears it.
// Lets us auto-name stores from devtools({ name }) without any API change.
let pending: string | null = null

export function setNameContext(name: string): void {
  pending = name
}

export function takeNameContext(): string | null {
  const n = pending
  pending = null
  return n
}

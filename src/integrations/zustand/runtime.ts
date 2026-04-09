// Holds the runtime reference to zustand's `create`, populated after detectZustand() runs.
// Separate file to break the circular dep between index.ts <-> create.ts.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _create: ((...args: any[]) => any) | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setZustandCreate(fn: (...args: any[]) => any): void {
  _create = fn
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getZustandCreate(): ((...args: any[]) => any) | null {
  return _create
}

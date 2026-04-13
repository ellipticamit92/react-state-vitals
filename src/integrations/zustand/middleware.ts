// Re-exports of zustand/middleware with name interception.
// Import these instead of "zustand/middleware" — API is identical.
//
//   import { persist, devtools } from "react-state-vitals/zustand"

export type {
  PersistOptions,
  DevtoolsOptions,
} from 'zustand/middleware'

import {
  devtools as zustandDevtools,
  persist as zustandPersist,
} from 'zustand/middleware'
import type { StateCreator, StoreMutatorIdentifier } from 'zustand'
import { setNameContext } from './name-context'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutators = [StoreMutatorIdentifier, unknown][]

export function devtools<
  T,
  Mps extends AnyMutators = [],
  Mcs extends AnyMutators = [],
>(
  initializer: StateCreator<T, [...Mps, ['zustand/devtools', never]], Mcs>,
  options?: { name?: string; [key: string]: unknown },
): StateCreator<T, Mps, [['zustand/devtools', never], ...Mcs]> {
  if (options?.name) setNameContext(options.name)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zustandDevtools(initializer as any, options as any) as any
}

export function persist<
  T,
  Mps extends AnyMutators = [],
  Mcs extends AnyMutators = [],
>(
  initializer: StateCreator<T, [...Mps, ['zustand/persist', unknown]], Mcs>,
  options: { name: string; [key: string]: unknown },
): StateCreator<T, Mps, [['zustand/persist', unknown], ...Mcs]> {
  setNameContext(options.name)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zustandPersist(initializer as any, options as any) as any
}

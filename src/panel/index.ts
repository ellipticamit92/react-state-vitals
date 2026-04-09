import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Panel } from './Panel'

let container: HTMLDivElement | null = null
let root: Root | null = null

export function mountPanel(): void {
  if (typeof document === 'undefined') return

  container = document.createElement('div')
  container.id = 'react-state-vitals-root'
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(createElement(Panel))
}

export function unmountPanel(): void {
  root?.unmount()
  container?.remove()
  root = null
  container = null
}

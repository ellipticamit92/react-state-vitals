import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Panel } from './Panel'

interface MountPanelOptions {
  heapPollMs?: number
}

let container: HTMLDivElement | null = null
let root: Root | null = null

export function mountPanel(options: MountPanelOptions = {}): void {
  if (typeof document === 'undefined') return

  container = document.createElement('div')
  container.id = 'react-state-vitals-root'
  document.body.appendChild(container)

  root = createRoot(container)
  root.render(createElement(Panel, options))
}

export function unmountPanel(): void {
  root?.unmount()
  container?.remove()
  root = null
  container = null
}

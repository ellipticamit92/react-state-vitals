"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }

var _chunkFVQVI5NGjs = require('./chunk-FVQVI5NG.js');


var _chunkHEHTJLSOjs = require('./chunk-HEHTJLSO.js');





var _chunkTTNOYA6Ljs = require('./chunk-TTNOYA6L.js');




var _chunkRUL5H3VHjs = require('./chunk-RUL5H3VH.js');

// src/integrations/index.ts
async function detectIntegrations() {
  const [zustand, reactQuery] = await Promise.all([
    _chunkFVQVI5NGjs.detectZustand.call(void 0, ),
    _chunkHEHTJLSOjs.detectReactQuery.call(void 0, )
  ]);
  const heap = typeof performance !== "undefined" && "memory" in performance;
  if (zustand) _chunkRUL5H3VHjs.emitter.emit("integration:ready", { name: "zustand" });
  _chunkRUL5H3VHjs.emitter.emit("integration:ready", { name: "context" });
  if (heap) _chunkRUL5H3VHjs.emitter.emit("integration:ready", { name: "heap" });
  if (reactQuery) _chunkRUL5H3VHjs.emitter.emit("integration:ready", { name: "react-query" });
  return { zustand, context: true, heap, reactQuery };
}

// src/panel/index.ts
var _react = require('react'); var ReactNs = _interopRequireWildcard(_react);
var _client = require('react-dom/client');

// src/panel/Panel.tsx


// #style-inject:#style-inject
function styleInject(css, { insertAt } = {}) {
  if (!css || typeof document === "undefined") return;
  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");
  style.type = "text/css";
  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

// src/panel/styles.css
styleInject('/*! tailwindcss v4.2.2 | MIT License | https://tailwindcss.com */\n@layer properties;\n@layer theme, base, components, utilities;\n@layer theme {\n  :root,\n  :host {\n    --font-sans:\n      ui-sans-serif,\n      system-ui,\n      sans-serif,\n      "Apple Color Emoji",\n      "Segoe UI Emoji",\n      "Segoe UI Symbol",\n      "Noto Color Emoji";\n    --font-mono:\n      ui-monospace,\n      SFMono-Regular,\n      Menlo,\n      Monaco,\n      Consolas,\n      "Liberation Mono",\n      "Courier New",\n      monospace;\n    --color-red-400: oklch(70.4% 0.191 22.216);\n    --color-red-500: oklch(63.7% 0.237 25.331);\n    --color-yellow-300: oklch(90.5% 0.182 98.111);\n    --color-yellow-400: oklch(85.2% 0.199 91.936);\n    --color-yellow-500: oklch(79.5% 0.184 86.047);\n    --color-yellow-600: oklch(68.1% 0.162 75.834);\n    --color-green-400: oklch(79.2% 0.209 151.711);\n    --color-green-500: oklch(72.3% 0.219 149.579);\n    --color-emerald-400: oklch(76.5% 0.177 163.223);\n    --color-cyan-400: oklch(78.9% 0.154 211.53);\n    --color-cyan-500: oklch(71.5% 0.143 215.221);\n    --color-blue-400: oklch(70.7% 0.165 254.624);\n    --color-blue-500: oklch(62.3% 0.214 259.815);\n    --color-violet-400: oklch(70.2% 0.183 293.541);\n    --color-purple-400: oklch(71.4% 0.203 305.504);\n    --color-purple-500: oklch(62.7% 0.265 303.9);\n    --color-slate-100: oklch(96.8% 0.007 247.896);\n    --color-slate-300: oklch(86.9% 0.022 252.894);\n    --color-slate-400: oklch(70.4% 0.04 256.788);\n    --color-slate-500: oklch(55.4% 0.046 257.417);\n    --color-slate-600: oklch(44.6% 0.043 257.281);\n    --color-slate-700: oklch(37.2% 0.044 257.287);\n    --color-slate-800: oklch(27.9% 0.041 260.031);\n    --color-slate-900: oklch(20.8% 0.042 265.755);\n    --color-gray-100: oklch(96.7% 0.003 264.542);\n    --color-gray-400: oklch(70.7% 0.022 261.325);\n    --color-gray-700: oklch(37.3% 0.034 259.733);\n    --color-gray-800: oklch(27.8% 0.033 256.848);\n    --color-gray-900: oklch(21% 0.034 264.665);\n    --spacing: 0.25rem;\n    --text-sm: 0.875rem;\n    --text-sm--line-height: calc(1.25 / 0.875);\n    --text-base: 1rem;\n    --text-base--line-height: calc(1.5 / 1);\n    --font-weight-normal: 400;\n    --font-weight-semibold: 600;\n    --tracking-wide: 0.025em;\n    --leading-tight: 1.25;\n    --leading-snug: 1.375;\n    --radius-md: 0.375rem;\n    --radius-lg: 0.5rem;\n    --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n    --default-transition-duration: 150ms;\n    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    --default-font-family: var(--font-sans);\n    --default-mono-font-family: var(--font-mono);\n  }\n}\n@layer base {\n  *,\n  ::after,\n  ::before,\n  ::backdrop,\n  ::file-selector-button {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n    border: 0 solid;\n  }\n  html,\n  :host {\n    line-height: 1.5;\n    -webkit-text-size-adjust: 100%;\n    tab-size: 4;\n    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");\n    font-feature-settings: var(--default-font-feature-settings, normal);\n    font-variation-settings: var(--default-font-variation-settings, normal);\n    -webkit-tap-highlight-color: transparent;\n  }\n  hr {\n    height: 0;\n    color: inherit;\n    border-top-width: 1px;\n  }\n  abbr:where([title]) {\n    -webkit-text-decoration: underline dotted;\n    text-decoration: underline dotted;\n  }\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n  a {\n    color: inherit;\n    -webkit-text-decoration: inherit;\n    text-decoration: inherit;\n  }\n  b,\n  strong {\n    font-weight: bolder;\n  }\n  code,\n  kbd,\n  samp,\n  pre {\n    font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);\n    font-feature-settings: var(--default-mono-font-feature-settings, normal);\n    font-variation-settings: var(--default-mono-font-variation-settings, normal);\n    font-size: 1em;\n  }\n  small {\n    font-size: 80%;\n  }\n  sub,\n  sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n  sub {\n    bottom: -0.25em;\n  }\n  sup {\n    top: -0.5em;\n  }\n  table {\n    text-indent: 0;\n    border-color: inherit;\n    border-collapse: collapse;\n  }\n  :-moz-focusring {\n    outline: auto;\n  }\n  progress {\n    vertical-align: baseline;\n  }\n  summary {\n    display: list-item;\n  }\n  ol,\n  ul,\n  menu {\n    list-style: none;\n  }\n  img,\n  svg,\n  video,\n  canvas,\n  audio,\n  iframe,\n  embed,\n  object {\n    display: block;\n    vertical-align: middle;\n  }\n  img,\n  video {\n    max-width: 100%;\n    height: auto;\n  }\n  button,\n  input,\n  select,\n  optgroup,\n  textarea,\n  ::file-selector-button {\n    font: inherit;\n    font-feature-settings: inherit;\n    font-variation-settings: inherit;\n    letter-spacing: inherit;\n    color: inherit;\n    border-radius: 0;\n    background-color: transparent;\n    opacity: 1;\n  }\n  :where(select:is([multiple], [size])) optgroup {\n    font-weight: bolder;\n  }\n  :where(select:is([multiple], [size])) optgroup option {\n    padding-inline-start: 20px;\n  }\n  ::file-selector-button {\n    margin-inline-end: 4px;\n  }\n  ::placeholder {\n    opacity: 1;\n  }\n  @supports (not (-webkit-appearance: -apple-pay-button)) or (contain-intrinsic-size: 1px) {\n    ::placeholder {\n      color: currentcolor;\n      @supports (color: color-mix(in lab, red, red)) {\n        color: color-mix(in oklab, currentcolor 50%, transparent);\n      }\n    }\n  }\n  textarea {\n    resize: vertical;\n  }\n  ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n  ::-webkit-date-and-time-value {\n    min-height: 1lh;\n    text-align: inherit;\n  }\n  ::-webkit-datetime-edit {\n    display: inline-flex;\n  }\n  ::-webkit-datetime-edit-fields-wrapper {\n    padding: 0;\n  }\n  ::-webkit-datetime-edit,\n  ::-webkit-datetime-edit-year-field,\n  ::-webkit-datetime-edit-month-field,\n  ::-webkit-datetime-edit-day-field,\n  ::-webkit-datetime-edit-hour-field,\n  ::-webkit-datetime-edit-minute-field,\n  ::-webkit-datetime-edit-second-field,\n  ::-webkit-datetime-edit-millisecond-field,\n  ::-webkit-datetime-edit-meridiem-field {\n    padding-block: 0;\n  }\n  ::-webkit-calendar-picker-indicator {\n    line-height: 1;\n  }\n  :-moz-ui-invalid {\n    box-shadow: none;\n  }\n  button,\n  input:where([type=button], [type=reset], [type=submit]),\n  ::file-selector-button {\n    appearance: button;\n  }\n  ::-webkit-inner-spin-button,\n  ::-webkit-outer-spin-button {\n    height: auto;\n  }\n  [hidden]:where(:not([hidden=until-found])) {\n    display: none !important;\n  }\n}\n@layer utilities {\n  .visible {\n    visibility: visible;\n  }\n  .absolute {\n    position: absolute;\n  }\n  .fixed {\n    position: fixed;\n  }\n  .start {\n    inset-inline-start: var(--spacing);\n  }\n  .top-4 {\n    top: calc(var(--spacing) * 4);\n  }\n  .right-0 {\n    right: calc(var(--spacing) * 0);\n  }\n  .right-1 {\n    right: calc(var(--spacing) * 1);\n  }\n  .right-4 {\n    right: calc(var(--spacing) * 4);\n  }\n  .bottom-0 {\n    bottom: calc(var(--spacing) * 0);\n  }\n  .bottom-1 {\n    bottom: calc(var(--spacing) * 1);\n  }\n  .z-\\[9999\\] {\n    z-index: 9999;\n  }\n  .container {\n    width: 100%;\n    @media (width >= 40rem) {\n      max-width: 40rem;\n    }\n    @media (width >= 48rem) {\n      max-width: 48rem;\n    }\n    @media (width >= 64rem) {\n      max-width: 64rem;\n    }\n    @media (width >= 80rem) {\n      max-width: 80rem;\n    }\n    @media (width >= 96rem) {\n      max-width: 96rem;\n    }\n  }\n  .mx-2 {\n    margin-inline: calc(var(--spacing) * 2);\n  }\n  .mt-0\\.5 {\n    margin-top: calc(var(--spacing) * 0.5);\n  }\n  .mt-1 {\n    margin-top: calc(var(--spacing) * 1);\n  }\n  .mt-1\\.5 {\n    margin-top: calc(var(--spacing) * 1.5);\n  }\n  .mt-px {\n    margin-top: 1px;\n  }\n  .mb-2 {\n    margin-bottom: calc(var(--spacing) * 2);\n  }\n  .ml-1 {\n    margin-left: calc(var(--spacing) * 1);\n  }\n  .ml-auto {\n    margin-left: auto;\n  }\n  .block {\n    display: block;\n  }\n  .contents {\n    display: contents;\n  }\n  .flex {\n    display: flex;\n  }\n  .hidden {\n    display: none;\n  }\n  .inline-block {\n    display: inline-block;\n  }\n  .h-0\\.5 {\n    height: calc(var(--spacing) * 0.5);\n  }\n  .h-1 {\n    height: calc(var(--spacing) * 1);\n  }\n  .h-1\\.5 {\n    height: calc(var(--spacing) * 1.5);\n  }\n  .h-2 {\n    height: calc(var(--spacing) * 2);\n  }\n  .h-4 {\n    height: calc(var(--spacing) * 4);\n  }\n  .h-5 {\n    height: calc(var(--spacing) * 5);\n  }\n  .h-full {\n    height: 100%;\n  }\n  .min-h-0 {\n    min-height: calc(var(--spacing) * 0);\n  }\n  .w-1\\.5 {\n    width: calc(var(--spacing) * 1.5);\n  }\n  .w-2 {\n    width: calc(var(--spacing) * 2);\n  }\n  .w-4 {\n    width: calc(var(--spacing) * 4);\n  }\n  .w-5 {\n    width: calc(var(--spacing) * 5);\n  }\n  .w-full {\n    width: 100%;\n  }\n  .min-w-0 {\n    min-width: calc(var(--spacing) * 0);\n  }\n  .flex-1 {\n    flex: 1;\n  }\n  .flex-shrink-0 {\n    flex-shrink: 0;\n  }\n  .shrink-0 {\n    flex-shrink: 0;\n  }\n  .transform {\n    transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);\n  }\n  .animate-pulse {\n    animation: var(--animate-pulse);\n  }\n  .cursor-se-resize {\n    cursor: se-resize;\n  }\n  .flex-col {\n    flex-direction: column;\n  }\n  .flex-wrap {\n    flex-wrap: wrap;\n  }\n  .items-center {\n    align-items: center;\n  }\n  .items-start {\n    align-items: flex-start;\n  }\n  .justify-between {\n    justify-content: space-between;\n  }\n  .justify-center {\n    justify-content: center;\n  }\n  .justify-end {\n    justify-content: flex-end;\n  }\n  .gap-1 {\n    gap: calc(var(--spacing) * 1);\n  }\n  .gap-1\\.5 {\n    gap: calc(var(--spacing) * 1.5);\n  }\n  .gap-2 {\n    gap: calc(var(--spacing) * 2);\n  }\n  .gap-3 {\n    gap: calc(var(--spacing) * 3);\n  }\n  .space-y-0\\.5 {\n    :where(& > :not(:last-child)) {\n      --tw-space-y-reverse: 0;\n      margin-block-start: calc(calc(var(--spacing) * 0.5) * var(--tw-space-y-reverse));\n      margin-block-end: calc(calc(var(--spacing) * 0.5) * calc(1 - var(--tw-space-y-reverse)));\n    }\n  }\n  .space-y-1 {\n    :where(& > :not(:last-child)) {\n      --tw-space-y-reverse: 0;\n      margin-block-start: calc(calc(var(--spacing) * 1) * var(--tw-space-y-reverse));\n      margin-block-end: calc(calc(var(--spacing) * 1) * calc(1 - var(--tw-space-y-reverse)));\n    }\n  }\n  .space-y-2 {\n    :where(& > :not(:last-child)) {\n      --tw-space-y-reverse: 0;\n      margin-block-start: calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));\n      margin-block-end: calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-reverse)));\n    }\n  }\n  .truncate {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .overflow-hidden {\n    overflow: hidden;\n  }\n  .overflow-y-auto {\n    overflow-y: auto;\n  }\n  .rounded {\n    border-radius: 0.25rem;\n  }\n  .rounded-full {\n    border-radius: calc(infinity * 1px);\n  }\n  .rounded-lg {\n    border-radius: var(--radius-lg);\n  }\n  .rounded-md {\n    border-radius: var(--radius-md);\n  }\n  .border {\n    border-style: var(--tw-border-style);\n    border-width: 1px;\n  }\n  .border-t {\n    border-top-style: var(--tw-border-style);\n    border-top-width: 1px;\n  }\n  .border-r {\n    border-right-style: var(--tw-border-style);\n    border-right-width: 1px;\n  }\n  .border-b {\n    border-bottom-style: var(--tw-border-style);\n    border-bottom-width: 1px;\n  }\n  .border-gray-700 {\n    border-color: var(--color-gray-700);\n  }\n  .border-slate-500 {\n    border-color: var(--color-slate-500);\n  }\n  .border-slate-700 {\n    border-color: var(--color-slate-700);\n  }\n  .border-slate-700\\/80 {\n    border-color: color-mix(in srgb, oklch(37.2% 0.044 257.287) 80%, transparent);\n    @supports (color: color-mix(in lab, red, red)) {\n      border-color: color-mix(in oklab, var(--color-slate-700) 80%, transparent);\n    }\n  }\n  .border-slate-800 {\n    border-color: var(--color-slate-800);\n  }\n  .border-yellow-500\\/30 {\n    border-color: color-mix(in srgb, oklch(79.5% 0.184 86.047) 30%, transparent);\n    @supports (color: color-mix(in lab, red, red)) {\n      border-color: color-mix(in oklab, var(--color-yellow-500) 30%, transparent);\n    }\n  }\n  .bg-blue-400 {\n    background-color: var(--color-blue-400);\n  }\n  .bg-blue-500 {\n    background-color: var(--color-blue-500);\n  }\n  .bg-gray-700 {\n    background-color: var(--color-gray-700);\n  }\n  .bg-gray-900 {\n    background-color: var(--color-gray-900);\n  }\n  .bg-green-400 {\n    background-color: var(--color-green-400);\n  }\n  .bg-green-500 {\n    background-color: var(--color-green-500);\n  }\n  .bg-purple-400 {\n    background-color: var(--color-purple-400);\n  }\n  .bg-purple-500 {\n    background-color: var(--color-purple-500);\n  }\n  .bg-red-400 {\n    background-color: var(--color-red-400);\n  }\n  .bg-red-500 {\n    background-color: var(--color-red-500);\n  }\n  .bg-slate-800 {\n    background-color: var(--color-slate-800);\n  }\n  .bg-slate-800\\/50 {\n    background-color: color-mix(in srgb, oklch(27.9% 0.041 260.031) 50%, transparent);\n    @supports (color: color-mix(in lab, red, red)) {\n      background-color: color-mix(in oklab, var(--color-slate-800) 50%, transparent);\n    }\n  }\n  .bg-slate-800\\/60 {\n    background-color: color-mix(in srgb, oklch(27.9% 0.041 260.031) 60%, transparent);\n    @supports (color: color-mix(in lab, red, red)) {\n      background-color: color-mix(in oklab, var(--color-slate-800) 60%, transparent);\n    }\n  }\n  .bg-slate-900 {\n    background-color: var(--color-slate-900);\n  }\n  .bg-transparent {\n    background-color: transparent;\n  }\n  .bg-yellow-400 {\n    background-color: var(--color-yellow-400);\n  }\n  .bg-yellow-500\\/10 {\n    background-color: color-mix(in srgb, oklch(79.5% 0.184 86.047) 10%, transparent);\n    @supports (color: color-mix(in lab, red, red)) {\n      background-color: color-mix(in oklab, var(--color-yellow-500) 10%, transparent);\n    }\n  }\n  .px-1 {\n    padding-inline: calc(var(--spacing) * 1);\n  }\n  .px-2 {\n    padding-inline: calc(var(--spacing) * 2);\n  }\n  .px-2\\.5 {\n    padding-inline: calc(var(--spacing) * 2.5);\n  }\n  .px-3 {\n    padding-inline: calc(var(--spacing) * 3);\n  }\n  .py-1 {\n    padding-block: calc(var(--spacing) * 1);\n  }\n  .py-1\\.5 {\n    padding-block: calc(var(--spacing) * 1.5);\n  }\n  .py-2 {\n    padding-block: calc(var(--spacing) * 2);\n  }\n  .pb-1 {\n    padding-bottom: calc(var(--spacing) * 1);\n  }\n  .pb-2 {\n    padding-bottom: calc(var(--spacing) * 2);\n  }\n  .pl-2 {\n    padding-left: calc(var(--spacing) * 2);\n  }\n  .text-center {\n    text-align: center;\n  }\n  .text-left {\n    text-align: left;\n  }\n  .font-mono {\n    font-family: var(--font-mono);\n  }\n  .text-base {\n    font-size: var(--text-base);\n    line-height: var(--tw-leading, var(--text-base--line-height));\n  }\n  .text-sm {\n    font-size: var(--text-sm);\n    line-height: var(--tw-leading, var(--text-sm--line-height));\n  }\n  .text-\\[8px\\] {\n    font-size: 8px;\n  }\n  .text-\\[9px\\] {\n    font-size: 9px;\n  }\n  .text-\\[10px\\] {\n    font-size: 10px;\n  }\n  .text-\\[11px\\] {\n    font-size: 11px;\n  }\n  .text-\\[13px\\] {\n    font-size: 13px;\n  }\n  .leading-none {\n    --tw-leading: 1;\n    line-height: 1;\n  }\n  .leading-snug {\n    --tw-leading: var(--leading-snug);\n    line-height: var(--leading-snug);\n  }\n  .leading-tight {\n    --tw-leading: var(--leading-tight);\n    line-height: var(--leading-tight);\n  }\n  .font-normal {\n    --tw-font-weight: var(--font-weight-normal);\n    font-weight: var(--font-weight-normal);\n  }\n  .font-semibold {\n    --tw-font-weight: var(--font-weight-semibold);\n    font-weight: var(--font-weight-semibold);\n  }\n  .tracking-wide {\n    --tw-tracking: var(--tracking-wide);\n    letter-spacing: var(--tracking-wide);\n  }\n  .text-blue-400 {\n    color: var(--color-blue-400);\n  }\n  .text-cyan-400 {\n    color: var(--color-cyan-400);\n  }\n  .text-cyan-500 {\n    color: var(--color-cyan-500);\n  }\n  .text-emerald-400 {\n    color: var(--color-emerald-400);\n  }\n  .text-gray-100 {\n    color: var(--color-gray-100);\n  }\n  .text-gray-400 {\n    color: var(--color-gray-400);\n  }\n  .text-green-400 {\n    color: var(--color-green-400);\n  }\n  .text-purple-400 {\n    color: var(--color-purple-400);\n  }\n  .text-red-400 {\n    color: var(--color-red-400);\n  }\n  .text-slate-100 {\n    color: var(--color-slate-100);\n  }\n  .text-slate-300 {\n    color: var(--color-slate-300);\n  }\n  .text-slate-400 {\n    color: var(--color-slate-400);\n  }\n  .text-slate-500 {\n    color: var(--color-slate-500);\n  }\n  .text-slate-600 {\n    color: var(--color-slate-600);\n  }\n  .text-violet-400 {\n    color: var(--color-violet-400);\n  }\n  .text-yellow-300 {\n    color: var(--color-yellow-300);\n  }\n  .text-yellow-400 {\n    color: var(--color-yellow-400);\n  }\n  .text-yellow-600 {\n    color: var(--color-yellow-600);\n  }\n  .uppercase {\n    text-transform: uppercase;\n  }\n  .tabular-nums {\n    --tw-numeric-spacing: tabular-nums;\n    font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);\n  }\n  .shadow-2xl {\n    --tw-shadow: 0 25px 50px -12px var(--tw-shadow-color, rgb(0 0 0 / 0.25));\n    box-shadow:\n      var(--tw-inset-shadow),\n      var(--tw-inset-ring-shadow),\n      var(--tw-ring-offset-shadow),\n      var(--tw-ring-shadow),\n      var(--tw-shadow);\n  }\n  .transition {\n    transition-property:\n      color,\n      background-color,\n      border-color,\n      outline-color,\n      text-decoration-color,\n      fill,\n      stroke,\n      --tw-gradient-from,\n      --tw-gradient-via,\n      --tw-gradient-to,\n      opacity,\n      box-shadow,\n      transform,\n      translate,\n      scale,\n      rotate,\n      filter,\n      -webkit-backdrop-filter,\n      backdrop-filter,\n      display,\n      content-visibility,\n      overlay,\n      pointer-events;\n    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n    transition-duration: var(--tw-duration, var(--default-transition-duration));\n  }\n  .transition-all {\n    transition-property: all;\n    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n    transition-duration: var(--tw-duration, var(--default-transition-duration));\n  }\n  .transition-colors {\n    transition-property:\n      color,\n      background-color,\n      border-color,\n      outline-color,\n      text-decoration-color,\n      fill,\n      stroke,\n      --tw-gradient-from,\n      --tw-gradient-via,\n      --tw-gradient-to;\n    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));\n    transition-duration: var(--tw-duration, var(--default-transition-duration));\n  }\n  .duration-500 {\n    --tw-duration: 500ms;\n    transition-duration: 500ms;\n  }\n  .hover\\:bg-gray-800 {\n    &:hover {\n      @media (hover: hover) {\n        background-color: var(--color-gray-800);\n      }\n    }\n  }\n  .hover\\:bg-slate-700 {\n    &:hover {\n      @media (hover: hover) {\n        background-color: var(--color-slate-700);\n      }\n    }\n  }\n  .hover\\:bg-slate-800\\/60 {\n    &:hover {\n      @media (hover: hover) {\n        background-color: color-mix(in srgb, oklch(27.9% 0.041 260.031) 60%, transparent);\n        @supports (color: color-mix(in lab, red, red)) {\n          background-color: color-mix(in oklab, var(--color-slate-800) 60%, transparent);\n        }\n      }\n    }\n  }\n  .hover\\:text-red-400 {\n    &:hover {\n      @media (hover: hover) {\n        color: var(--color-red-400);\n      }\n    }\n  }\n  .hover\\:text-slate-300 {\n    &:hover {\n      @media (hover: hover) {\n        color: var(--color-slate-300);\n      }\n    }\n  }\n  .hover\\:text-yellow-400 {\n    &:hover {\n      @media (hover: hover) {\n        color: var(--color-yellow-400);\n      }\n    }\n  }\n}\n@property --tw-rotate-x { syntax: "*"; inherits: false; }\n@property --tw-rotate-y { syntax: "*"; inherits: false; }\n@property --tw-rotate-z { syntax: "*"; inherits: false; }\n@property --tw-skew-x { syntax: "*"; inherits: false; }\n@property --tw-skew-y { syntax: "*"; inherits: false; }\n@property --tw-space-y-reverse { syntax: "*"; inherits: false; initial-value: 0; }\n@property --tw-border-style { syntax: "*"; inherits: false; initial-value: solid; }\n@property --tw-leading { syntax: "*"; inherits: false; }\n@property --tw-font-weight { syntax: "*"; inherits: false; }\n@property --tw-tracking { syntax: "*"; inherits: false; }\n@property --tw-ordinal { syntax: "*"; inherits: false; }\n@property --tw-slashed-zero { syntax: "*"; inherits: false; }\n@property --tw-numeric-figure { syntax: "*"; inherits: false; }\n@property --tw-numeric-spacing { syntax: "*"; inherits: false; }\n@property --tw-numeric-fraction { syntax: "*"; inherits: false; }\n@property --tw-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }\n@property --tw-shadow-color { syntax: "*"; inherits: false; }\n@property --tw-shadow-alpha { syntax: "<percentage>"; inherits: false; initial-value: 100%; }\n@property --tw-inset-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }\n@property --tw-inset-shadow-color { syntax: "*"; inherits: false; }\n@property --tw-inset-shadow-alpha { syntax: "<percentage>"; inherits: false; initial-value: 100%; }\n@property --tw-ring-color { syntax: "*"; inherits: false; }\n@property --tw-ring-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }\n@property --tw-inset-ring-color { syntax: "*"; inherits: false; }\n@property --tw-inset-ring-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }\n@property --tw-ring-inset { syntax: "*"; inherits: false; }\n@property --tw-ring-offset-width { syntax: "<length>"; inherits: false; initial-value: 0px; }\n@property --tw-ring-offset-color { syntax: "*"; inherits: false; initial-value: #fff; }\n@property --tw-ring-offset-shadow { syntax: "*"; inherits: false; initial-value: 0 0 #0000; }\n@property --tw-duration { syntax: "*"; inherits: false; }\n@keyframes pulse {\n  50% {\n    opacity: 0.5;\n  }\n}\n@layer properties {\n  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {\n    *,\n    ::before,\n    ::after,\n    ::backdrop {\n      --tw-rotate-x: initial;\n      --tw-rotate-y: initial;\n      --tw-rotate-z: initial;\n      --tw-skew-x: initial;\n      --tw-skew-y: initial;\n      --tw-space-y-reverse: 0;\n      --tw-border-style: solid;\n      --tw-leading: initial;\n      --tw-font-weight: initial;\n      --tw-tracking: initial;\n      --tw-ordinal: initial;\n      --tw-slashed-zero: initial;\n      --tw-numeric-figure: initial;\n      --tw-numeric-spacing: initial;\n      --tw-numeric-fraction: initial;\n      --tw-shadow: 0 0 #0000;\n      --tw-shadow-color: initial;\n      --tw-shadow-alpha: 100%;\n      --tw-inset-shadow: 0 0 #0000;\n      --tw-inset-shadow-color: initial;\n      --tw-inset-shadow-alpha: 100%;\n      --tw-ring-color: initial;\n      --tw-ring-shadow: 0 0 #0000;\n      --tw-inset-ring-color: initial;\n      --tw-inset-ring-shadow: 0 0 #0000;\n      --tw-ring-inset: initial;\n      --tw-ring-offset-width: 0px;\n      --tw-ring-offset-color: #fff;\n      --tw-ring-offset-shadow: 0 0 #0000;\n      --tw-duration: initial;\n    }\n  }\n}\n');

// src/core/memory.ts
function isHeapAvailable() {
  return typeof performance !== "undefined" && "memory" in performance;
}
function getHeapSnapshot() {
  if (!isHeapAvailable()) return null;
  const mem = performance.memory;
  return {
    usedMB: mem.usedJSHeapSize / 1048576,
    totalMB: mem.totalJSHeapSize / 1048576,
    limitMB: mem.jsHeapSizeLimit / 1048576,
    timestamp: Date.now()
  };
}

// src/panel/constants.ts
var WARN_RATIO = 0.75;
var HEAP_POLL_MS = 2e3;
var ACCENT_COLORS = {
  green: {
    text: "text-green-400",
    bar: "bg-green-500",
    dot: "bg-green-400"
  },
  blue: {
    text: "text-blue-400",
    bar: "bg-blue-500",
    dot: "bg-blue-400"
  },
  purple: {
    text: "text-purple-400",
    bar: "bg-purple-500",
    dot: "bg-purple-400"
  }
};
var STATUS_COLORS = {
  ok: {
    text: "text-green-400",
    bar: "bg-green-400",
    dot: "bg-green-400"
  },
  warn: {
    text: "text-yellow-400",
    bar: "bg-yellow-400",
    dot: "bg-yellow-400"
  },
  danger: {
    text: "text-red-400",
    bar: "bg-red-500",
    dot: "bg-red-400 animate-pulse"
  }
};
var getStatus = (size, limit) => {
  const ratio = size / limit;
  if (ratio > 1) return "danger";
  if (ratio > WARN_RATIO) return "warn";
  return "ok";
};
var getColor = (level) => STATUS_COLORS[level];
var formatKB = (kb) => kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb.toFixed(1)}KB`;

// src/panel/Panel.tsx
var _jsxruntime = require('react/jsx-runtime');
var DEFAULT_PANEL_WIDTH = 360;
var DEFAULT_PANEL_HEIGHT = 480;
var MIN_PANEL_WIDTH = 260;
var MIN_PANEL_HEIGHT = 220;
var MAX_HEAP_HISTORY = 60;
function SparklineChart({
  series,
  width = 200,
  height = 64
}) {
  const hasData = series.some((s) => s.data.length >= 2);
  if (!hasData) {
    return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      "div",
      {
        style: { width, height },
        className: "rounded bg-slate-800/50 flex items-center justify-center",
        children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-[9px] text-slate-600", children: "collecting\u2026" })
      }
    );
  }
  const pad = 4;
  const renderedSeries = series.filter((s) => s.data.length >= 2).map((s) => {
    const min = Math.min(...s.data);
    const max = Math.max(...s.data);
    const range = max - min || 1;
    const pts = s.data.map((v, i) => {
      const x = i / (s.data.length - 1) * width;
      const y = height - pad - (v - min) / range * (height - pad * 2);
      return [x, y];
    });
    return _chunkRUL5H3VHjs.__spreadProps.call(void 0, _chunkRUL5H3VHjs.__spreadValues.call(void 0, {}, s), { pts });
  });
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
    "svg",
    {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      style: { overflow: "visible", display: "block" },
      children: [
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "defs", { children: renderedSeries.map((s) => /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "linearGradient", { id: s.gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "stop", { offset: "0%", stopColor: s.gradientColor, stopOpacity: "0.3" }),
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "stop", { offset: "100%", stopColor: s.gradientColor, stopOpacity: "0.0" })
        ] }, s.gradientId)) }),
        renderedSeries.map((s) => {
          const fillPoly = [
            `0,${height}`,
            ...s.pts.map(([x, y]) => `${x},${y}`),
            `${width},${height}`
          ].join(" ");
          const polyline = s.pts.map(([x, y]) => `${x},${y}`).join(" ");
          const last = s.pts[s.pts.length - 1];
          return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "g", { children: [
            /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "polygon", { points: fillPoly, fill: `url(#${s.gradientId})` }),
            /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
              "polyline",
              {
                points: polyline,
                fill: "none",
                stroke: s.strokeColor,
                strokeWidth: "1.5",
                strokeLinejoin: "round",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "circle", { cx: last[0], cy: last[1], r: "2.5", fill: s.strokeColor })
          ] }, s.gradientId);
        })
      ]
    }
  );
}
function CircularGauge({
  pct,
  label,
  size = 72
}) {
  const clamped = Math.min(Math.max(pct, 0), 100);
  const color = clamped > 90 ? "#f87171" : clamped > 70 ? "#facc15" : "#06b6d4";
  const trackColor = "#1e293b";
  const inner = Math.round(size * 0.72);
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex flex-col items-center gap-1", children: [
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      "div",
      {
        style: {
          width: size,
          height: size,
          borderRadius: "50%",
          background: `conic-gradient(${color} 0% ${clamped}%, ${trackColor} ${clamped}% 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        },
        children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
          "div",
          {
            style: {
              width: inner,
              height: inner,
              borderRadius: "50%",
              background: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
              "span",
              {
                style: {
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                  fontFamily: "monospace"
                },
                children: [
                  clamped.toFixed(1),
                  "%"
                ]
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-[9px] text-slate-400 text-center leading-tight", children: label })
  ] });
}
function Dot({
  level,
  colorOverride,
  className
}) {
  const { dot } = getColor(level);
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    "span",
    {
      className: `w-1.5 h-1.5 rounded-full ${className != null ? className : ""} ${colorOverride != null ? colorOverride : dot}`
    }
  );
}
function ProgressBar({
  value,
  max,
  level,
  barColor
}) {
  const pct = Math.min(value / max * 100, 100);
  const color = barColor != null ? barColor : getColor(level).bar;
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "h-1 w-full bg-gray-700 rounded overflow-hidden", children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    "div",
    {
      className: `h-full ${color} transition-all duration-500`,
      style: { width: `${pct}%` }
    }
  ) });
}
function ChevronIcon({ open }) {
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    "svg",
    {
      width: "10",
      height: "10",
      viewBox: "0 0 10 10",
      style: {
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 0.15s ease"
      },
      children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
        "polyline",
        {
          points: "1,3 5,7 9,3",
          fill: "none",
          stroke: "#94a3b8",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    }
  );
}
function Collapsible({
  title,
  open,
  onToggle,
  children
}) {
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { children: [
    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
      "button",
      {
        onClick: onToggle,
        className: "w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-800/60 transition-colors text-left",
        children: [
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, ChevronIcon, { open }),
          title
        ]
      }
    ),
    open && children
  ] });
}
function Row({
  name,
  sizeKB,
  limitKB,
  extra,
  accent = "green"
}) {
  const level = getStatus(sizeKB, limitKB);
  const { text, bar } = getColor(level);
  const accentColors = ACCENT_COLORS[accent != null ? accent : "green"];
  const nameColor = level === "ok" ? accentColors.text : text;
  const barColor = level === "ok" ? accentColors.bar : bar;
  const dotColor = level === "ok" ? accentColors.dot : void 0;
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "px-2 py-1 rounded hover:bg-gray-800 transition-colors", children: [
    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center justify-between text-[10px]", children: [
      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex min-w-0 flex-1 items-center gap-1.5 truncate", children: [
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, Dot, { level, colorOverride: dotColor }),
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: `truncate ${nameColor}`, children: name })
      ] }),
      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
        "span",
        {
          className: `tabular-nums pl-2 ${level === "ok" ? nameColor : text}`,
          children: [
            formatKB(sizeKB),
            limitKB > 0 && /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-500", children: [
              "/",
              formatKB(limitKB)
            ] })
          ]
        }
      )
    ] }),
    extra ? /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1 flex flex-wrap items-center justify-end gap-2 text-[9px]", children: extra }) : null,
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1", children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      ProgressBar,
      {
        value: sizeKB,
        max: limitKB,
        level,
        barColor
      }
    ) })
  ] });
}
function Section({
  title,
  items,
  render,
  open,
  onToggle
}) {
  if (!items.length) return null;
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    Collapsible,
    {
      open,
      onToggle,
      title: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-[11px] text-slate-300 font-semibold uppercase tracking-wide", children: [
        title,
        " ",
        /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-500 font-normal", children: [
          "(",
          items.length,
          ")"
        ] })
      ] }),
      children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "space-y-0.5 pb-1", children: items.map(render) })
    }
  );
}
function StoreRow({ store, accent = "green" }) {
  var _a;
  const consumers = (_a = store.consumers) != null ? _a : [];
  const level = getStatus(store.sizeKB, store.limitKB);
  const { text, bar } = getColor(level);
  const accentColors = ACCENT_COLORS[accent];
  const nameColor = level === "ok" ? accentColors.text : text;
  const barColor = level === "ok" ? accentColors.bar : bar;
  const dotColor = level === "ok" ? accentColors.dot : void 0;
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "px-2 py-1 rounded hover:bg-gray-800 transition-colors", children: [
    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center justify-between text-[10px]", children: [
      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex min-w-0 flex-1 items-center gap-1.5 truncate", children: [
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, Dot, { level, colorOverride: dotColor }),
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: `truncate ${nameColor}`, children: store.name })
      ] }),
      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: `tabular-nums pl-2 ${level === "ok" ? nameColor : text}`, children: [
        formatKB(store.sizeKB),
        store.limitKB > 0 && /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-500", children: [
          "/",
          formatKB(store.limitKB)
        ] })
      ] })
    ] }),
    store.renders ? /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1 flex flex-wrap items-center justify-end gap-2 text-[9px]", children: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-cyan-400", children: [
      store.renders,
      " ",
      store.renders === 1 ? "render" : "renders"
    ] }) }) : null,
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1", children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      ProgressBar,
      {
        value: store.sizeKB,
        max: store.limitKB,
        level,
        barColor
      }
    ) }),
    consumers.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1.5 space-y-0.5", children: consumers.map((consumer) => /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
      "div",
      {
        className: "flex items-center justify-between text-[9px] px-1",
        children: [
          /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-400 truncate", children: [
            "\u2013 ",
            consumer.component
          ] }),
          /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "tabular-nums text-cyan-500 pl-2 shrink-0", children: [
            consumer.renders,
            "\xD7"
          ] })
        ]
      },
      consumer.component
    )) })
  ] });
}
function ContextRow({ store }) {
  var _a;
  const consumers = (_a = store.consumers) != null ? _a : [];
  const level = getStatus(store.sizeKB, store.limitKB);
  const accentColors = ACCENT_COLORS["blue"];
  const nameColor = level === "ok" ? accentColors.text : getColor(level).text;
  const barColor = level === "ok" ? accentColors.bar : getColor(level).bar;
  const dotColor = level === "ok" ? accentColors.dot : void 0;
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "px-2 py-1 rounded hover:bg-gray-800 transition-colors", children: [
    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center justify-between text-[10px]", children: [
      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex min-w-0 flex-1 items-center gap-1.5 truncate", children: [
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, Dot, { level, colorOverride: dotColor }),
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: `truncate ${nameColor}`, children: store.name })
      ] }),
      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: `tabular-nums pl-2 ${nameColor}`, children: [
        formatKB(store.sizeKB),
        store.renders ? /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-500 ml-1", children: [
          store.renders,
          " ",
          store.renders === 1 ? "render" : "renders"
        ] }) : null
      ] })
    ] }),
    store.consumerRenders ? /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "mt-0.5 text-[9px] text-violet-400", children: [
      store.consumerRenders,
      " consumer",
      " ",
      store.consumerRenders === 1 ? "render" : "renders"
    ] }) : null,
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1", children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      ProgressBar,
      {
        value: store.sizeKB,
        max: store.limitKB,
        level,
        barColor
      }
    ) }),
    consumers.length > 0 ? /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "mt-1.5 space-y-0.5", children: consumers.map((consumer) => /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
      "div",
      {
        className: "flex items-center justify-between text-[9px] px-1",
        children: [
          /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-400 truncate", children: [
            "\u2013 ",
            consumer.component
          ] }),
          /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "tabular-nums text-cyan-500 pl-2 shrink-0", children: [
            consumer.renders,
            "\xD7"
          ] })
        ]
      },
      consumer.component
    )) }) : null
  ] });
}
function CacheRow({ store }) {
  var _a;
  const queries = (_a = store.queries) != null ? _a : [];
  const fetching = queries.filter((q) => q.fetchStatus === "fetching").length;
  const errors = queries.filter((q) => q.status === "error").length;
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    Row,
    {
      name: store.name,
      sizeKB: store.sizeKB,
      limitKB: store.limitKB,
      accent: "purple",
      extra: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, _jsxruntime.Fragment, { children: [
        fetching > 0 && /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-blue-400", children: [
          fetching,
          " fetching"
        ] }),
        errors > 0 && /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-red-400", children: [
          errors,
          " err"
        ] }),
        /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-gray-400", children: [
          queries.length,
          " queries"
        ] })
      ] })
    }
  );
}
function Panel({ heapPollMs = HEAP_POLL_MS }) {
  var _a, _b, _c;
  const [isOpen, setIsOpen] = _react.useState.call(void 0, true);
  const [stores, setStores] = _react.useState.call(void 0, []);
  const storesRef = _react.useRef.call(void 0, []);
  const [heap, setHeap] = _react.useState.call(void 0, null);
  const [heapHistory, setHeapHistory] = _react.useState.call(void 0, []);
  const [statesHistory, setStatesHistory] = _react.useState.call(void 0, []);
  const [conflicts, setConflicts] = _react.useState.call(void 0, []);
  const [pos, setPos] = _react.useState.call(void 0, null);
  const [panelSize, setPanelSize] = _react.useState.call(void 0, {
    width: DEFAULT_PANEL_WIDTH,
    height: DEFAULT_PANEL_HEIGHT
  });
  const [dragging, setDragging] = _react.useState.call(void 0, false);
  const [resizing, setResizing] = _react.useState.call(void 0, false);
  const [memoryOpen, setMemoryOpen] = _react.useState.call(void 0, true);
  const [statesOpen, setStatesOpen] = _react.useState.call(void 0, true);
  const [zustandOpen, setZustandOpen] = _react.useState.call(void 0, true);
  const [contextOpen, setContextOpen] = _react.useState.call(void 0, true);
  const [cacheOpen, setCacheOpen] = _react.useState.call(void 0, true);
  const dragRef = _react.useRef.call(void 0, null);
  const resizeRef = _react.useRef.call(void 0, null);
  const panelRef = _react.useRef.call(void 0, null);
  _react.useLayoutEffect.call(void 0, () => {
    if (panelRef.current && pos === null) {
      const h = panelRef.current.offsetHeight;
      const w = panelRef.current.offsetWidth;
      setPos({
        x: window.innerWidth - w - 15,
        y: window.innerHeight - h - 20
      });
    }
  });
  const snapToNearestCorner = (x, y) => {
    const panel = panelRef.current;
    const pw = panel ? panel.offsetWidth : 288;
    const ph = panel ? panel.offsetHeight : 300;
    const margin = 12;
    const snapX = x + pw / 2 < window.innerWidth / 2 ? margin : window.innerWidth - pw - margin;
    const snapY = y + ph / 2 < window.innerHeight / 2 ? margin : window.innerHeight - ph - margin;
    setPos({ x: snapX, y: snapY });
  };
  const onHeaderMouseDown = (e) => {
    if (!pos) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y
    };
    setDragging(true);
    let lastX = pos.x;
    let lastY = pos.y;
    const onMouseMove = (ev) => {
      if (!dragRef.current) return;
      lastX = Math.max(
        0,
        Math.min(
          dragRef.current.origX + ev.clientX - dragRef.current.startX,
          window.innerWidth - panelSize.width
        )
      );
      lastY = Math.max(
        0,
        Math.min(
          dragRef.current.origY + ev.clientY - dragRef.current.startY,
          window.innerHeight - 40
        )
      );
      setPos({ x: lastX, y: lastY });
    };
    const onMouseUp = () => {
      dragRef.current = null;
      setDragging(false);
      snapToNearestCorner(lastX, lastY);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origWidth: panelSize.width,
      origHeight: panelSize.height
    };
    setResizing(true);
    const onMouseMove = (ev) => {
      if (!resizeRef.current || !pos) return;
      const maxWidth = Math.max(MIN_PANEL_WIDTH, window.innerWidth - pos.x - 8);
      const maxHeight = Math.max(
        MIN_PANEL_HEIGHT,
        window.innerHeight - pos.y - 8
      );
      const nextWidth = Math.min(
        maxWidth,
        Math.max(
          MIN_PANEL_WIDTH,
          resizeRef.current.origWidth + (ev.clientX - resizeRef.current.startX)
        )
      );
      const nextHeight = Math.min(
        maxHeight,
        Math.max(
          MIN_PANEL_HEIGHT,
          resizeRef.current.origHeight + (ev.clientY - resizeRef.current.startY)
        )
      );
      setPanelSize({ width: nextWidth, height: nextHeight });
    };
    const onMouseUp = () => {
      resizeRef.current = null;
      setResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  _react.useEffect.call(void 0, () => {
    const reg = _chunkTTNOYA6Ljs.getRegistry.call(void 0, );
    const initial = [];
    reg.forEach((entry, name) => {
      const last = entry.snapshots[entry.snapshots.length - 1];
      if (last) {
        initial.push({
          name,
          type: entry.type,
          sizeKB: last.sizeKB,
          limitKB: last.limitKB,
          keys: last.keys,
          renders: last.renders,
          consumerRenders: last.consumerRenders,
          consumers: last.consumers,
          queries: last.queries
        });
      }
    });
    storesRef.current = initial;
    setStores(initial);
    const unsubStore = _chunkRUL5H3VHjs.emitter.on(
      "store:update",
      ({
        name,
        sizeKB,
        limitKB,
        keys,
        renders,
        consumerRenders,
        consumers,
        queries
      }) => {
        setStores((prev) => {
          var _a2, _b2, _c2;
          const existing = prev.find((s) => s.name === name);
          const type = (_c2 = (_b2 = existing == null ? void 0 : existing.type) != null ? _b2 : (_a2 = _chunkTTNOYA6Ljs.getRegistry.call(void 0, ).get(name)) == null ? void 0 : _a2.type) != null ? _c2 : "zustand";
          const next = [
            ...prev.filter((s) => s.name !== name),
            {
              name,
              type,
              sizeKB,
              limitKB,
              keys,
              renders,
              consumerRenders: consumerRenders != null ? consumerRenders : existing == null ? void 0 : existing.consumerRenders,
              consumers: consumers != null ? consumers : existing == null ? void 0 : existing.consumers,
              queries
            }
          ];
          storesRef.current = next;
          return next;
        });
      }
    );
    const heapInterval = setInterval(() => {
      if (isHeapAvailable()) {
        const snap = getHeapSnapshot();
        if (snap) {
          setHeap(snap);
          setHeapHistory(
            (prev) => [...prev, snap.usedMB].slice(-MAX_HEAP_HISTORY)
          );
        }
      }
      const totalStatesKB = storesRef.current.reduce((sum, s) => sum + s.sizeKB, 0);
      if (storesRef.current.length > 0) {
        setStatesHistory(
          (prev) => [...prev, totalStatesKB].slice(-MAX_HEAP_HISTORY)
        );
      }
    }, heapPollMs);
    const unsubConflict = _chunkRUL5H3VHjs.emitter.on("panel:conflict", ({ name, message }) => {
      setConflicts(
        (prev) => prev.some((c) => c.name === name) ? prev : [...prev, { name, message }]
      );
    });
    return () => {
      unsubConflict();
      unsubStore();
      if (heapInterval) clearInterval(heapInterval);
    };
  }, [heapPollMs]);
  const zustand = stores.filter((s) => s.type === "zustand");
  const context = stores.filter((s) => s.type === "context");
  const cache = stores.filter((s) => s.type === "cache");
  const totalKB = stores.reduce((sum, s) => sum + s.sizeKB, 0) + (heap ? heap.usedMB * 1024 : 0);
  const totalLimitKB = stores.reduce((sum, s) => sum + s.limitKB, 0) + (heap ? heap.limitMB * 1024 : 0);
  const totalLevel = getStatus(totalKB, totalLimitKB);
  const heapPct = heap ? heap.usedMB / heap.limitMB * 100 : 0;
  if (!isOpen) {
    return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "fixed top-4 right-4 z-[9999] flex items-center gap-1.5 rounded-full bg-gray-900 px-2 py-1 text-sm text-emerald-400 border border-gray-700",
        children: [
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, Dot, { level: "ok", className: "w-2 h-2" }),
          "StateVitals"
        ]
      }
    );
  }
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
    "div",
    {
      ref: panelRef,
      className: "fixed z-[9999] flex flex-col bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl font-mono text-gray-100 overflow-hidden",
      style: {
        left: (_a = pos == null ? void 0 : pos.x) != null ? _a : 0,
        top: (_b = pos == null ? void 0 : pos.y) != null ? _b : 0,
        width: panelSize.width,
        height: panelSize.height,
        visibility: pos ? "visible" : "hidden",
        transition: dragging || resizing ? "none" : "left 0.2s ease, top 0.2s ease"
      },
      children: [
        /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
          "div",
          {
            className: "flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700/80 shrink-0",
            style: { cursor: dragging ? "grabbing" : "move" },
            onMouseDown: onHeaderMouseDown,
            children: [
              /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "svg", { width: "14", height: "12", viewBox: "0 0 14 12", fill: "none", children: [0, 4, 8].map((y) => /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                  "line",
                  {
                    x1: "0",
                    y1: y + 1,
                    x2: "14",
                    y2: y + 1,
                    stroke: "#94a3b8",
                    strokeWidth: "1.5",
                    strokeLinecap: "round"
                  },
                  y
                )) }),
                /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-[13px] font-semibold text-slate-100", children: "StateVitals Monitor" })
              ] }),
              /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center gap-1", onMouseDown: (e) => e.stopPropagation(), children: [
                /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                  "button",
                  {
                    onClick: () => setIsOpen(false),
                    className: "w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 text-base leading-none",
                    title: "Minimize",
                    children: "\u2013"
                  }
                ),
                /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                  "button",
                  {
                    onClick: () => setIsOpen(false),
                    className: "w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-700 text-base leading-none",
                    title: "Close",
                    children: "\xD7"
                  }
                )
              ] })
            ]
          }
        ),
        conflicts.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "border-b border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1.5 space-y-1 shrink-0", children: conflicts.map((c) => /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-start gap-1.5", children: [
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-yellow-400 mt-px flex-shrink-0", children: "\u26A0" }),
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-yellow-300 text-[8px] leading-snug", children: c.message }),
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
            "button",
            {
              onClick: () => setConflicts((prev) => prev.filter((x) => x.name !== c.name)),
              className: "ml-auto text-base text-yellow-600 hover:text-yellow-400 flex-shrink-0 leading-none",
              children: "\xD7"
            }
          )
        ] }, c.name)) }),
        /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex-1 min-h-0 overflow-y-auto", children: [
          (heap || statesHistory.length > 0) && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
            Collapsible,
            {
              open: memoryOpen,
              onToggle: () => setMemoryOpen((v) => !v),
              title: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-[11px] text-slate-300 font-semibold uppercase tracking-wide", children: "Memory" }),
              children: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "px-2 pb-2", children: [
                /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center gap-3 mb-2 text-[10px]", children: [
                  heap && /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, _jsxruntime.Fragment, { children: [
                    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-slate-400", children: [
                      "Total:",
                      " ",
                      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-emerald-400 font-semibold", children: [
                        heap.totalMB.toFixed(0),
                        "MB"
                      ] })
                    ] }),
                    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "flex items-center gap-1 text-slate-400", children: [
                      /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "inline-block w-2 h-0.5 rounded", style: { background: "#22d3ee" } }),
                      "Heap:",
                      " ",
                      /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "text-cyan-400 font-semibold", children: [
                        heap.usedMB.toFixed(0),
                        "MB"
                      ] })
                    ] })
                  ] }),
                  statesHistory.length > 0 && /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "span", { className: "flex items-center gap-1 text-slate-400", children: [
                    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "inline-block w-2 h-0.5 rounded", style: { background: "#34d399" } }),
                    "States:",
                    " ",
                    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-emerald-400 font-semibold", children: formatKB((_c = statesHistory[statesHistory.length - 1]) != null ? _c : 0) })
                  ] })
                ] }),
                /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, 
                  "div",
                  {
                    className: "flex items-center gap-2 rounded-md overflow-hidden",
                    style: { background: "rgba(15,23,42,0.7)", padding: "8px" },
                    children: [
                      /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                        SparklineChart,
                        {
                          series: [
                            ...heapHistory.length >= 2 ? [{
                              data: heapHistory,
                              strokeColor: "#22d3ee",
                              gradientColor: "#06b6d4",
                              gradientId: "svGradHeap"
                            }] : [],
                            ...statesHistory.length >= 2 ? [{
                              data: statesHistory,
                              strokeColor: "#34d399",
                              gradientColor: "#10b981",
                              gradientId: "svGradStates"
                            }] : []
                          ],
                          width: panelSize.width - 140,
                          height: 64
                        }
                      ) }),
                      heap && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, CircularGauge, { pct: heapPct, label: "Heap Usage", size: 72 })
                    ]
                  }
                )
              ] })
            }
          ),
          (heap || statesHistory.length > 0) && stores.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "border-t border-slate-800 mx-2" }),
          stores.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
            Collapsible,
            {
              open: statesOpen,
              onToggle: () => setStatesOpen((v) => !v),
              title: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-[11px] text-slate-300 font-semibold uppercase tracking-wide", children: "Active States" }),
              children: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "space-y-2 pb-2", children: [
                zustand.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                  Section,
                  {
                    title: "Zustand",
                    items: zustand,
                    render: (s) => /* @__PURE__ */ _jsxruntime.jsx.call(void 0, StoreRow, { store: s, accent: "green" }, s.name),
                    open: zustandOpen,
                    onToggle: () => setZustandOpen((v) => !v)
                  }
                ),
                context.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                  Section,
                  {
                    title: "React Context",
                    items: context,
                    render: (s) => /* @__PURE__ */ _jsxruntime.jsx.call(void 0, ContextRow, { store: s }, s.name),
                    open: contextOpen,
                    onToggle: () => setContextOpen((v) => !v)
                  }
                ),
                cache.length > 0 && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
                  Section,
                  {
                    title: "Cache",
                    items: cache,
                    render: (s) => /* @__PURE__ */ _jsxruntime.jsx.call(void 0, CacheRow, { store: s }, s.name),
                    open: cacheOpen,
                    onToggle: () => setCacheOpen((v) => !v)
                  }
                )
              ] })
            }
          )
        ] }),
        (stores.length > 0 || heap) && /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "px-3 py-1.5 border-t border-slate-700 bg-slate-800/60 shrink-0", children: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "flex items-center justify-between text-[10px]", children: [
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "text-slate-400", children: "Total Size" }),
          /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
            "span",
            {
              className: `tabular-nums font-semibold ${getColor(totalLevel).text}`,
              children: formatKB(totalKB)
            }
          )
        ] }) }),
        /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
          "button",
          {
            type: "button",
            "aria-label": "Resize panel",
            onMouseDown: onResizeMouseDown,
            className: "absolute bottom-0 right-0 h-4 w-4 cursor-se-resize bg-transparent",
            children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "span", { className: "absolute bottom-1 right-1 h-2 w-2 border-r border-b border-slate-500" })
          }
        )
      ]
    }
  );
}

// src/panel/index.ts
var container = null;
var root = null;
function mountPanel(options = {}) {
  if (typeof document === "undefined") return;
  container = document.createElement("div");
  container.id = "react-state-vitals-root";
  document.body.appendChild(container);
  root = _client.createRoot.call(void 0, container);
  root.render(_react.createElement.call(void 0, Panel, options));
}

// src/integrations/context/index.ts









var DEFAULT_LIMIT_KB = 50;
var consumerRenderStore = /* @__PURE__ */ new Map();
var trackedContexts = /* @__PURE__ */ new WeakMap();
var isUseContextPatched = false;
function getConsumerStats(name) {
  const stats = consumerRenderStore.get(name);
  if (!stats) return [];
  return Array.from(stats.entries()).map(([component, renders]) => ({ component, renders })).sort((a, b) => b.renders - a.renders);
}
function inferComponentNameFromStack() {
  var _a;
  const fallback = "AnonymousConsumer";
  const stack = new Error().stack;
  if (!stack) return fallback;
  const lines = stack.split("\n");
  const ignored = /* @__PURE__ */ new Set([
    "useTrackedContext",
    "patchedUseContext",
    "Object.patchedUseContext",
    "notify"
  ]);
  const ignoredFragments = [
    "node_modules",
    "react-dom",
    "scheduler",
    "__webpack",
    "next/dist"
  ];
  const normalizeComponentName = (rawName) => {
    const cleaned = rawName.replace(/^Object\./, "").replace(/^Module\./, "").replace(/^exports\./, "").replace(/^eval at .+$/, "").replace(/^\[as .+\]\s*/, "").replace(/\$+/g, "").replace(/^bound\s+/, "").trim();
    if (!cleaned) return null;
    if (!/^[A-Z]/.test(cleaned)) return null;
    if (ignored.has(cleaned)) return null;
    if (cleaned === "renderWithHooks" || cleaned === "beginWork" || cleaned === "commitRoot") {
      return null;
    }
    return cleaned;
  };
  for (const line of lines) {
    if (ignoredFragments.some((fragment) => line.includes(fragment))) continue;
    const match = line.match(/at\s+([A-Za-z0-9_$\.]+)/);
    if (!match) continue;
    const raw = match[1];
    const fnName = raw.includes(".") ? (_a = raw.split(".").pop()) != null ? _a : raw : raw;
    if (!fnName || fnName.startsWith("use")) continue;
    const normalized = normalizeComponentName(fnName);
    if (normalized) return normalized;
  }
  return fallback;
}
function recordConsumerRender(name, componentName) {
  var _a;
  const nextComponentName = componentName && componentName.trim().length > 0 ? componentName : inferComponentNameFromStack();
  if (!consumerRenderStore.has(name)) {
    consumerRenderStore.set(name, /* @__PURE__ */ new Map());
  }
  const contextConsumers = consumerRenderStore.get(name);
  contextConsumers.set(
    nextComponentName,
    ((_a = contextConsumers.get(nextComponentName)) != null ? _a : 0) + 1
  );
}
function emitConsumerUpdate(name) {
  const entry = _chunkTTNOYA6Ljs.getRegistry.call(void 0, ).get(name);
  if (!entry) return;
  const last = entry.snapshots[entry.snapshots.length - 1];
  if (!last) return;
  const consumers = getConsumerStats(name);
  const consumerRenders = consumers.reduce((sum, c) => sum + c.renders, 0);
  _chunkRUL5H3VHjs.emitter.emit("store:update", {
    name,
    sizeKB: last.sizeKB,
    limitKB: last.limitKB,
    keys: last.keys,
    renders: last.renders,
    consumerRenders,
    consumers
  });
}
function ensureUseContextPatched() {
  if (isUseContextPatched || process.env.NODE_ENV !== "development") return;
  const descriptor = Object.getOwnPropertyDescriptor(ReactNs, "useContext");
  if (!descriptor || descriptor.configurable !== true) {
    return;
  }
  const originalUseContext = ReactNs.useContext;
  const patchedUseContext = function(context) {
    const value = originalUseContext(context);
    const trackedName = trackedContexts.get(context);
    if (trackedName) {
      recordConsumerRender(trackedName);
      Promise.resolve().then(() => emitConsumerUpdate(trackedName));
    }
    return value;
  };
  try {
    Object.defineProperty(ReactNs, "useContext", {
      value: patchedUseContext,
      configurable: true,
      writable: true
    });
    isUseContextPatched = true;
  } catch (e) {
  }
}
function setupConsumerTracking(name, context) {
  var _a;
  if (process.env.NODE_ENV !== "development") return;
  const ctx = context;
  const valueProp = "_currentValue";
  if (!(valueProp in ctx)) {
    trackedContexts.set(context, name);
    ensureUseContextPatched();
    return;
  }
  const desc = Object.getOwnPropertyDescriptor(ctx, valueProp);
  if (desc && typeof desc.get === "function") return;
  let internalValue = desc == null ? void 0 : desc.value;
  let flushPending = false;
  try {
    Object.defineProperty(ctx, valueProp, {
      enumerable: (_a = desc == null ? void 0 : desc.enumerable) != null ? _a : true,
      configurable: true,
      get() {
        const componentName = inferComponentNameFromStack();
        if (componentName !== "AnonymousConsumer") {
          recordConsumerRender(name, componentName);
          if (!flushPending) {
            flushPending = true;
            Promise.resolve().then(() => {
              flushPending = false;
              emitConsumerUpdate(name);
            });
          }
        }
        return internalValue;
      },
      set(v) {
        internalValue = v;
      }
    });
  } catch (e) {
    trackedContexts.set(context, name);
    ensureUseContextPatched();
  }
}
function measureKB(value) {
  try {
    const seen = /* @__PURE__ */ new WeakSet();
    const json = JSON.stringify(value, (_key, nextValue) => {
      if (typeof nextValue === "bigint") {
        return `${nextValue.toString()}n`;
      }
      if (typeof nextValue === "function") {
        return "[Function]";
      }
      if (typeof nextValue === "symbol") {
        return nextValue.toString();
      }
      if (nextValue && typeof nextValue === "object") {
        if (seen.has(nextValue)) return "[Circular]";
        seen.add(nextValue);
      }
      return nextValue;
    });
    return new Blob([json != null ? json : ""]).size / 1024;
  } catch (e) {
    return 0;
  }
}
function keysOf(value) {
  return value !== null && typeof value === "object" ? Object.keys(value) : [];
}
function notify(name, getValue, snapshots, limitKB, renders) {
  const current = getValue();
  const sizeKB = measureKB(current);
  const keys = keysOf(current);
  const consumers = getConsumerStats(name);
  const consumerRenders = consumers.reduce((sum, c) => sum + c.renders, 0);
  snapshots.push({
    name,
    sizeKB,
    limitKB,
    keys,
    updatedAt: Date.now(),
    renders,
    consumerRenders,
    consumers
  });
  _chunkRUL5H3VHjs.emitter.emit("store:update", {
    name,
    sizeKB,
    limitKB,
    keys,
    renders,
    consumerRenders,
    consumers
  });
  if (sizeKB > limitKB * 0.8) {
    _chunkRUL5H3VHjs.emitter.emit("store:warning", { name, sizeKB, limitKB });
  }
}
function useContextMonitor(name, value, options = {}) {
  const opts = typeof options === "number" ? { limitKB: options } : options;
  const { limitKB = DEFAULT_LIMIT_KB, getValue, context } = opts;
  if (context !== void 0 && process.env.NODE_ENV === "development") {
    setupConsumerTracking(name, context);
  }
  const valueRef = _react.useRef.call(void 0, value);
  const getterRef = _react.useRef.call(void 0, getValue);
  const snapshotsRef = _react.useRef.call(void 0, []);
  const renderCountRef = _react.useRef.call(void 0, 0);
  valueRef.current = value;
  getterRef.current = getValue;
  renderCountRef.current += 1;
  const stableGetter = _react.useRef.call(void 0, 
    () => getterRef.current ? getterRef.current() : valueRef.current
  ).current;
  _react.useEffect.call(void 0, () => {
    if (process.env.NODE_ENV !== "development") return;
    snapshotsRef.current = [];
    _chunkTTNOYA6Ljs.registerStore.call(void 0, name, {
      name,
      type: "context",
      snapshots: snapshotsRef.current,
      unsub: () => {
      }
    });
    return () => {
      consumerRenderStore.delete(name);
      _chunkTTNOYA6Ljs.unregisterStore.call(void 0, name);
    };
  }, [name, limitKB]);
  _react.useEffect.call(void 0, () => {
    if (process.env.NODE_ENV !== "development") return;
    notify(
      name,
      stableGetter,
      snapshotsRef.current,
      limitKB,
      renderCountRef.current
    );
  });
}
function useTrackedContext(name, context, componentName) {
  const value = _react.useContext.call(void 0, context);
  _react.useEffect.call(void 0, () => {
    if (process.env.NODE_ENV !== "development") return;
    recordConsumerRender(name, componentName);
    emitConsumerUpdate(name);
  });
  return value;
}
function createTrackedContextHook(name, context) {
  return function useTrackedContextHook(componentName) {
    return useTrackedContext(name, context, componentName);
  };
}
function monitorContext(name, context, options = {}) {
  if (process.env.NODE_ENV === "development") {
    setupConsumerTracking(name, context);
  }
  function monitor({ children }) {
    const value = _react.useContext.call(void 0, context);
    useContextMonitor(name, value, options);
    return _react.createElement.call(void 0, _react.Fragment, null, children);
  }
  monitor.displayName = `Monitor(${name})`;
  return monitor;
}
function patchContext(name, context, options = {}) {
  if (process.env.NODE_ENV !== "development") return;
  setupConsumerTracking(name, context);
  const ctx = context;
  const OriginalProvider = ctx["Provider"];
  function MonitoredProvider({
    value,
    children
  }) {
    useContextMonitor(name, value, options);
    return _react.createElement.call(void 0, OriginalProvider, { value }, children);
  }
  MonitoredProvider.displayName = `Monitor(${name})`;
  try {
    Object.defineProperty(ctx, "Provider", {
      value: MonitoredProvider,
      configurable: true,
      writable: true
    });
  } catch (e) {
    console.warn(
      `[react-state-vitals] patchContext: could not patch "${name}" context Provider. Use monitorContext() or useContextMonitor() instead.`
    );
  }
}
function createMonitoredContext(name, limitKB = DEFAULT_LIMIT_KB) {
  const Context = _react.createContext.call(void 0, void 0);
  if (process.env.NODE_ENV === "development") {
    setupConsumerTracking(name, Context);
  }
  function Provider({ value, children }) {
    useContextMonitor(name, value, { limitKB });
    return _react.createElement.call(void 0, Context.Provider, { value }, children);
  }
  Provider.displayName = `Monitor(${name})`;
  return { Context, Provider };
}

// src/index.ts
async function init() {
  if (process.env.NODE_ENV !== "development") return;
  await detectIntegrations();
  mountPanel();
}













exports.clearRegistry = _chunkTTNOYA6Ljs.clearRegistry; exports.createMonitoredContext = createMonitoredContext; exports.createTrackedContextHook = createTrackedContextHook; exports.emitter = _chunkRUL5H3VHjs.emitter; exports.getHeapSnapshot = getHeapSnapshot; exports.getRegistry = _chunkTTNOYA6Ljs.getRegistry; exports.init = init; exports.isHeapAvailable = isHeapAvailable; exports.monitorContext = monitorContext; exports.patchContext = patchContext; exports.useContextMonitor = useContextMonitor; exports.useTrackedContext = useTrackedContext;
//# sourceMappingURL=index.js.map
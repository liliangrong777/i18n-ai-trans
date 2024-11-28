// 1. Import the style
import '@/assets/main.css'
import ReactDOM from 'react-dom/client'
import { addStyle } from './util.ts'
import App from './App.tsx'

window.document.body.dataset.insurancePlugin = 'PENDING'

export default defineContentScript({
  matches: ['<all_urls>'],
  // 2. Set cssInjectionMode
  cssInjectionMode: 'ui',
  runAt: 'document_end',

  async main(ctx) {
    const ui1 = createIntegratedUi(ctx, {
      position: 'inline',
      onMount: (container) => {
        addStyle(container)
      },
    })
    ui1.mount()
    const ui = await createShadowRootUi(ctx, {
      name: 'insurance-content-app',
      position: 'inline',
      onMount: (container) => {
        const app = document.createElement('div')
        container.append(app)
        // Create a root on the UI container and render a component
        const root = ReactDOM.createRoot(container)
        root.render(<App />)
        return root
      },
      onRemove: (root) => {
        // Unmount the root when the UI is removed
        root?.unmount()
      },
    })

    // Call mount to add the UI to the DOM
    ui.mount()
    setInterval(() => {
      const node = document.querySelector('insurance-content-app')
      if (node) {
        if (node.parentNode?.lastElementChild !== node) {
          node.parentNode?.appendChild(node)
        }
      }
    }, 1000)
  },
})

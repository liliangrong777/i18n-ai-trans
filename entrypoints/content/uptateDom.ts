import { FrameBorder, globalFitter } from '@/entrypoints/content/fitters.ts'

const addStyles = (type, customCss) => {
  const bodyElement = document.querySelector('body')

  if (bodyElement && customCss) {
    const styleElement = document.createElement('style')
    styleElement.id = type
    styleElement.textContent = customCss

    bodyElement.appendChild(styleElement)
  }
}

const update = ['footerUpdateSection', 'updateSection', 'submit', 'anchor']

// 默认是全局样式
export const appPageCommon = (
  global = globalFitter,
  color = FrameBorder.red
) => {
  document.querySelectorAll('.insurance-mock-block')?.forEach((item) => {
    item.remove()
  })
  update.forEach((item) => {
    if (item === 'anchor') {
      global[item].trim() &&
        document.querySelectorAll(global[item].trim())?.forEach((item) => {
          item.insertAdjacentHTML(
            global.position,
            `<div class="insurance-mock-block" style="padding: 20px 50px; background: ${color}; color:#fff;">insurance mock block</div>`
          )
        })
    } else {
      const existingStyleElement = document.getElementById(item)
      if (existingStyleElement) {
        document.body.removeChild(existingStyleElement)
      }
      addStyles(
        item,
        `${global[item]}{ border: 3px solid ${color} !important;}`
      )
    }
  })
}

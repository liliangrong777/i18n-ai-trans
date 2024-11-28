export function addStyle(container) {
  // Append children to the container
  const style = document.createElement('style')
  style.innerHTML = `
[data-click-to-component] * {
    pointer-events: auto !important;
}

[data-click-to-component-target] {
    cursor: var(--click-to-component-cursor, context-menu) !important;
    outline: auto 1px !important;
    outline: var(
    --click-to-component-outline,
    -webkit-focus-ring-color auto 1px
    ) !important;
    opacity:0.9!important;
    z-index:9999999999999;
}
captain-enhance-ui{
    all: initial;   
}
insurance-content-app{
    z-index:9999999999999;
    position:relative;
    direction:ltr;
}
.insurance-mock-block{
    background:#f40;
    padding:20px;
    margin:0 12px;
}
.insurance-mock-price{
    outline: 2px solid #f40 !important;
}
          `
  container.append(style)
}

export function addScript(url, id) {
  if (id && document.getElementById(id)) return

  const script = document.createElement('script')
  script.src = url
  script.id = id
  // 设置 script 标签的属性，确保脚本加载成功
  script.type = 'text/javascript'
  script.async = true
  document.body.appendChild(script)
}

export function addScript2(src, id) {
  if (id && document.getElementById(id)) return
  // 使用 Fetch 下载外部 JS 文件的内容
  fetch(src)
    .then((response) => response.text()) // 将响应转换为文本
    .then((scriptContent) => {
      // 创建一个内联 script 标签
      const script = document.createElement('script')

      script.id = id
      // 将下载的 JS 文件内容注入到 script 标签中
      script.textContent = scriptContent

      // 将 script 标签插入页面的 <head> 中
      document.head.appendChild(script)

      console.log('Script injected successfully')
    })
    .catch((error) => {
      console.error('Failed to load and inject script:', error)
    })
}
export function checkIsCartPage() {
  const meta = document.querySelector<HTMLMetaElement>(
    "meta[property='og:url']"
  )
  return !!meta?.content?.includes('cart')
}

export function combineSections(oldSections = '', sections = '') {
  const newSections = [oldSections, sections].join(',')
  const validItems = newSections.split(',').filter((item) => item.trim())
  return [...new Set(validItems)].join(',')
}

export function getLimitedSelector(selector: string) {
  if (!selector) return ''
  // 加一些约束条件（如果有的话）,这样就不会找到其他页面里边去了
  const limits = checkIsCartPage()
    ? [
        'cart-items',
        '#cart',
        '.cart-items',
        '#main-cart-items',
        '.cart__footer-wrapper',
        '#main-cart-footer',
        '.cart__footer',
      ]
    : ['cart-drawer', '.drawer', '#CartDrawer', '.cart-drawer']

  const item = limits.find((item) => {
    return document.querySelectorAll(`${item} ${selector}`).length === 1
  })
  if (item) {
    return `${item} ${selector}`
  }
  return selector
}

// 接管fetch，统一处理错误
export async function fetchWrap<T = any>(fetchResult: Promise<Response>) {
  try {
    const data = await fetchResult
    return data.json() as unknown as T
  } catch (error) {
    console.log(`seel:fetch ${error}`)
    return null
  }
}

export function checkedScriptKeywords(keyword: string) {
  const scripts = [...document.querySelectorAll('script')]
  return scripts.some((item) => item.src.includes(keyword))
}

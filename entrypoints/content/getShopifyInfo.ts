export interface ShopifyInfo {
  themeId: string
  shop: string
  locale: string
  currency: { active: string; rate: string }
  country: string
  theme: any
}
export function getShopifyInfo() {
  const info: ShopifyInfo = {
    themeId: '',
    shop: '',
    locale: '',
    currency: { active: '', rate: '' },
    country: '',
    theme: undefined,
  }
  const scripts = document.querySelectorAll('script')
  for (let i = 0; i < scripts.length; i++) {
    const content = scripts[i].textContent
    if (typeof content === 'string') {
      const reg =
        /Shopify\.(shop|locale|currency|country|theme)\s*=\s*("?[^(;=)]+?"?);/g
      let match

      while ((match = reg.exec(content)) !== null) {
        const [_, name, value] = match
        try {
          info[name] = JSON.parse(value)
        } catch (error) {
          console.log(error)
          info[name] = value
        }
      }
    }
  }
  info.themeId = info.theme?.id ?? ''
  return info
}

export function checkAppEmbed() {
  const scripts = [...document.querySelectorAll('script')]
  const keyword =
    window.__CurrentApp === 'P' ? 'ins-theme-app' : 'ins-theme-app'
  return scripts.some((item) => item.src.includes(keyword))
}

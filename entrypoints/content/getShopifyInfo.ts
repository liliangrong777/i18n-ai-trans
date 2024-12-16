export interface ShopifyInfo {
  themeName: string
  themeId: string
  shop: string
  locale: string
  currency: { active: string; rate: string }
  country: string
  theme: any
}

function parseJsonOrStr(value) {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.log(error)
    return value
  }
}
export function getShopifyInfo() {
  const info: ShopifyInfo = {
    themeName: '',
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
        /Shopify\.(shop|locale|currency|country|theme)\s*=\s*([^;=]+);/g
      let match

      while ((match = reg.exec(content)) !== null) {
        const [_, name, value] = match
        info[name] = parseJsonOrStr(value)
      }
      const match2 = content.match(/BOOMR.themeName\s*=\s*"(.+?)"/)
      if (match2) {
        info.themeName = match2[1]
      }
    }
  }
  info.themeId = info.theme?.id ?? ''
  return info
}

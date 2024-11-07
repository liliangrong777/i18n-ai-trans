export default defineBackground(() => {
  // 如果是shopify环境 添加一个S标记
  browser.runtime.onMessage.addListener(async (msg) => {
    const { action } = msg
    if (action === 'app:init') {
      const text = (await browser.action.getBadgeText({})) || 'ON'
      browser.action.setBadgeText({
        text: text,
      })
      return text
    }
  })

  browser.action.onClicked.addListener(() => {
    changeState()
  })

  // 拦截购物车change事件，将sections字段添加到storage中（主要是通信不好使）
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (!details.url.includes('/cart/change')) return
      if (details.method === 'POST') {
        console.log(details.url, details.url.includes('/cart/change'))

        const requestData = details.requestBody
        if (requestData?.raw) {
          const decoder = new TextDecoder('utf-8')
          try {
            const body = decoder.decode(requestData.raw[0].bytes)
            let sections = JSON.parse(body)?.sections ?? ''
            if (Array.isArray(sections)) {
              sections = sections.filter((item) => item).join(',')
            }
            if (typeof sections === 'string') {
              sections = sections.replace(/\d+/g, '{{id}}')
            }
            browser.tabs
              .query({ active: true, currentWindow: true })
              .then((tabs) => {
                if (tabs[0].id) {
                  browser.tabs.sendMessage(tabs[0].id, {
                    action: 'change:section',
                    data: sections,
                  })
                }
              })
          } catch (error) {
            console.log(error)
          }
        }
      }
    },
    { urls: ['<all_urls>'] },
    ['requestBody']
  )
})

export async function changeState() {
  // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await browser.action.getBadgeText({})
  // Next state will always be the opposite
  const nextState = prevState === 'ON' ? 'OFF' : 'ON'
  // Set the action badge to the next state
  await browser.action.setBadgeText({
    text: nextState,
  })

  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (tabs[0].id) {
    browser.tabs.sendMessage(tabs[0].id, { action: 'change:state' })
  }
}

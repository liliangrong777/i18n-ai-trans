import { AppTypeEnum, MsgEvent } from './content/constants'

export default defineBackground(() => {
  // 如果是shopify环境 添加一个S标记
  browser.runtime.onMessage.addListener(async (msg, sender) => {
    const { action } = msg
    if (action === MsgEvent.execInit) {
      const text = (await browser.action.getBadgeText({})) || 'ON'
      browser.action.setBadgeText({
        text: text,
      })
      return text
    }

    // 当用户没打开app embed给他动态插入一个
    if (action === MsgEvent.execScript && sender.tab?.id) {
      browser.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: () => {
          // 插入cf脚本
          function injectScriptFromUrl(url, scriptId) {
            const support = document.head || document.documentElement

            const script = document.createElement('script')
            const timestamp = new Date().getTime()
            const _url =
              url + '?ext=ins' + '&id=' + scriptId + '&ts=' + timestamp
            script.setAttribute('src', _url)
            script.setAttribute('type', 'module')
            script.id = scriptId
            script.setAttribute('extension', 'ins-dynamic')
            script.setAttribute('ts', timestamp + '')
            script.onload = () => {
              script.remove()
            }
            try {
              support.appendChild(script)
            } catch (err) {
              console.error(err, 'append')
            }
          }

          // 插入脚本
          injectScriptFromUrl(
            action.currentApp === AppTypeEnum.PP
              ? import.meta.env.VITE_PP_JS
              : import.meta.env.VITE_CAPTAIN_JS,
            'ins-script'
          )
        },
      })
    }
  })

  // 点击图标，切换插件开关状态
  browser.action.onClicked.addListener(() => {
    changeState()
  })

  // 拦截购物车change事件，将sections字段添加到storage中（主要是通信不好使）
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.url.includes('/cart/change')) {
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
                      action: MsgEvent.changeSection,
                      data: sections,
                    })
                  }
                })
            } catch (error) {
              console.log(error)
            }
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
    browser.tabs.sendMessage(tabs[0].id, { action: MsgEvent.toggleStatus })
  }
}

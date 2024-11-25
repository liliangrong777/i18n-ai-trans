import { useLayoutEffect } from 'react'
import { ShopifyInfo, getShopifyInfo } from './getShopifyInfo'
import { Toast } from '@/components'
import '@/assets/main.css'

import { Fitter, TypeEnum } from '@/entrypoints/content/fitters.ts'
import AppSubmitModal from './AppSubmitModal'
import AppInfoPanel from './AppInfoPanel'
import AppCollector, { useSelectorRender } from './AppCollector'
import {
  AppTypeEnum,
  CIKey,
  FitStatusEnum,
  MsgEvent,
  PPKey,
  PluginInBodyStatus,
  StorageKey,
} from './constants'
import { checkedScriptKeywords } from './util'
import { polyfill } from './polyfill'
const App = () => {
  const [shopifyInfo, setShopifyInfo] = useState<ShopifyInfo | null>(null)
  const [userFitter, setUserFitter] = useState<Fitter>({
    type: TypeEnum['PartialRender'],
    anchor: '',
    position: 'beforebegin',
    dynamicAnchor: '',
    dynamicPosition: 'beforebegin',
    updateSection: '',
    dynamicUpdateSection: '',
    footerUpdateSection: '',
    dynamicFooterUpdateSection: '',
    isRefreshCartPage: false,
    ppSeelCartTemplate: false,
    sections: '',
    submit: '',
    dynamicSubmit: '',
    isPrevent: true,
    dynamicSection: '',
  })

  const [isEnable, setIsEnable] = useState(false)
  const [isFit, setIsFit] = useState(false)

  const [currentApp, setCurrentApp] = useState<AppTypeEnum>(AppTypeEnum.PP)
  const [status, setStatus] = useState<FitStatusEnum>(FitStatusEnum.fitting)

  const [pluginStatus, setPluginStatus] = useState<PluginInBodyStatus>(
    PluginInBodyStatus.pending
  )
  useLayoutEffect(() => {
    window.document.body.dataset.insurancePlugin = PluginInBodyStatus.pending
    setPluginStatus(PluginInBodyStatus.pending)
    browser.runtime
      .sendMessage({
        action: MsgEvent.execInit,
      })
      .then(async (res) => {
        if (res === 'ON') {
          window.document.body.dataset.insurancePlugin = PluginInBodyStatus.on
          setPluginStatus(PluginInBodyStatus.on)
          const storageApp: any = window.sessionStorage.getItem(
            StorageKey.currentApp
          )
          const currentApp = storageApp
            ? storageApp
            : checkedScriptKeywords(PPKey)
              ? AppTypeEnum.PP
              : AppTypeEnum.Captain
          window.__CurrentApp = currentApp
          setCurrentApp(currentApp)

          init()
        } else {
          window.document.body.dataset.insurancePlugin = PluginInBodyStatus.off
          setPluginStatus(PluginInBodyStatus.off)
        }
      })

    browser.runtime.onMessage.addListener(async (message) => {
      const { action } = message
      if (action === MsgEvent.toggleStatus) {
        window.location.reload()
      }
    })
  }, [])

  const init = async () => {
    const shopify = getShopifyInfo()
    if (!shopify.shop) return

    if (!checkedScriptKeywords(PPKey) && !checkedScriptKeywords(CIKey)) {
      browser.runtime.sendMessage({
        action: MsgEvent.execScript,
        currentApp: window.__CurrentApp,
      })
    }
    setShopifyInfo(shopify)

    const queryString = new URLSearchParams({
      themeId: shopify.themeId,
      storeName: shopify.shop,
      themeName: shopify.themeName,
    }).toString()

    const [userInfo, resThemeInfo] = await Promise.all([
      polyfill.getInfo(shopify.shop),
      polyfill.getFitter(queryString),
    ])
    if (!userInfo || !resThemeInfo || resThemeInfo.code !== 200) return
    const { isEnable, isFit = false, status } = userInfo
    setIsEnable(isEnable)
    setIsFit(isFit)
    setUserFitter((val) => {
      return {
        ...val,
        type:
          window.__CurrentApp === AppTypeEnum.PP
            ? TypeEnum.PartialRender
            : TypeEnum.FakeUpdate,
        ...resThemeInfo.data.theme,
        ...resThemeInfo.data.user,
      }
    })
    setStatus(status)
  }

  // 是否适配中
  const isFitting = status === FitStatusEnum.fitting

  useSelectorRender({
    userFitter,
    isShow: isFitting && pluginStatus === PluginInBodyStatus.on,
  })

  if (!shopifyInfo || pluginStatus !== PluginInBodyStatus.on) return null
  return (
    <div style={{ all: 'initial' }}>
      <AppInfoPanel
        currentApp={currentApp}
        onCurrentAppChange={async (val: any) => {
          window.sessionStorage.setItem(StorageKey.currentApp, val)
          window.location.reload()
        }}
        shopifyInfo={shopifyInfo}
        userFitter={userFitter}
        themeName={shopifyInfo.themeName}
        isEnable={isEnable}
        status={status}
        onStatusChange={async (val) => {
          if (status === val) return
          await polyfill.beforeChangeStatus(val, status, {
            isFit: isFit,
          })
          window.sessionStorage.setItem(StorageKey.status, val + '')
          window.location.reload()
        }}
      />

      {isFitting && (
        <>
          <AppSubmitModal
            userFitter={userFitter}
            setUserFitter={setUserFitter}
            shopifyInfo={shopifyInfo}
          />
          <AppCollector userFitter={userFitter} setUserFitter={setUserFitter} />
        </>
      )}
      <Toast />
    </div>
  )
}
export default App

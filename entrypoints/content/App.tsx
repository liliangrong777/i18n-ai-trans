import { useLayoutEffect } from 'react'
import { ShopifyInfo, getShopifyInfo } from './getShopifyInfo'
import { Toast } from '@/components'
import '@/assets/main.css'

import {
  Fitter,
  TypeEnum,
  globalFitter,
} from '@/entrypoints/content/fitters.ts'
import { getThemeFitInfo, getUserConfig } from '@/entrypoints/content/apis.ts'
import { Config, FittersData } from '@/entrypoints/content/apis.d'
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
  const [userConfig, setUserConfig] = useState<Config | null>(null)

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
  const [fitterRes, setFitterRes] = useState<FittersData>({
    user: undefined,
    theme: undefined,
    theme_name: '',
  })

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
          const hasPPWidget = checkedScriptKeywords(PPKey)
          const defaultApp = hasPPWidget ? AppTypeEnum.PP : AppTypeEnum.Captain
          const storageApp: any = window.sessionStorage.getItem(
            StorageKey.currentApp
          )
          const currentApp = storageApp ?? defaultApp

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
      })
    }
    setShopifyInfo(shopify)

    const queryString = new URLSearchParams({
      themeId: shopify.themeId,
      storeName: shopify.shop,
      themeName: shopify.themeName,
    }).toString()

    const [resConfig, resThemeInfo] = await Promise.all([
      getUserConfig(shopify.shop),
      getThemeFitInfo(queryString),
    ])
    if (!resConfig || !resThemeInfo) return
    if (resConfig.code !== 200 || resThemeInfo.code !== 200) return
    setUserConfig(resConfig.data)
    setFitterRes(resThemeInfo.data)
    setUserFitter({
      ...globalFitter,
      ...resThemeInfo.data.theme,
      ...resThemeInfo.data.user,
    })
    const { isFit, isLocalFit } = resConfig.data

    const storageStatus = window.sessionStorage.getItem(StorageKey.status)

    if (storageStatus) {
      setStatus(+storageStatus)
      return
    }
    if (isLocalFit) {
      setStatus(FitStatusEnum.checking)
      return
    }
    if (isFit === 2) {
      setStatus(FitStatusEnum.published)
      return
    }
    setStatus(FitStatusEnum.fitting)
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
          window.__CurrentApp = val
          window.sessionStorage.setItem(StorageKey.currentApp, val)
          window.location.reload()
        }}
        shopifyInfo={shopifyInfo}
        userFitter={userFitter}
        themeName={fitterRes.theme_name}
        isEnable={userConfig?.isEnable ?? false}
        status={status}
        onStatusChange={async (val) => {
          if (status === val) return
          await polyfill.beforeChangeStatus(val, status, {
            isFit: userConfig?.isFit === 2,
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

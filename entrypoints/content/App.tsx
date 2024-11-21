import { useLayoutEffect } from 'react'
import { ShopifyInfo, getShopifyInfo } from './getShopifyInfo'
import { Toast } from '@/components'
import '@/assets/main.css'
import { storage } from '@wxt-dev/storage'

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
import { AppTypeEnum, FitStatusEnum } from './constants'
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

  useLayoutEffect(() => {
    window.document.body.dataset.insurancePlugin = 'PENDING'
    browser.runtime
      .sendMessage({
        action: 'app:init',
      })
      .then(async (res) => {
        if (res === 'ON') {
          window.document.body.dataset.insurancePlugin = 'ON'
          const isPPWidget = checkedScriptKeywords('ins-theme-app')
          const defaultApp = isPPWidget ? AppTypeEnum.PP : AppTypeEnum.Captain
          const storageApp: any =
            window.sessionStorage.getItem('ins:currentApp')
          const currentApp = storageApp ?? defaultApp

          window.__CurrentApp = currentApp
          setCurrentApp(currentApp)

          init()
        } else {
          window.document.body.dataset.insurancePlugin = 'OFF'
        }
      })

    browser.runtime.onMessage.addListener(async (message) => {
      const { action } = message
      if (action === 'change:state') {
        window.location.reload()
      }
    })
  }, [])

  const init = async () => {
    const shopify = getShopifyInfo()
    if (!shopify.shop) return
    setShopifyInfo(shopify)

    const queryString = new URLSearchParams({
      themeId: shopify.themeId,
      storeName: shopify.shop,
      themeName:shopify.themeName
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

    const storageStatus = window.sessionStorage.getItem('ins:status')

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
    isShow: isFitting,
  })

  if (!shopifyInfo || !userConfig) return null
  return (
    <div
      style={{
        all: 'initial',
      }}
    >
      <AppInfoPanel
        currentApp={currentApp}
        onCurrentAppChange={async (val: any) => {
          window.__CurrentApp = val
          window.sessionStorage.setItem('ins:currentApp', val)
          window.location.reload()
        }}
        shopifyInfo={shopifyInfo}
        userFitter={userFitter}
        themeName={fitterRes.theme_name}
        isEnable={userConfig.isEnable}
        isLocalFit={userConfig.isLocalFit}
        isFit={userConfig.isFit === 2}
        status={status}
        onStatusChange={async (val) => {
          await polyfill.beforeChangeStatus(val)
          window.sessionStorage.setItem('ins:status', val + '')
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

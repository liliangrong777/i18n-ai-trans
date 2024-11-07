import { useLayoutEffect } from 'react'
import { ShopifyInfo, getShopifyInfo } from './getShopifyInfo'
import { Toast } from '@/components'
import '@/assets/main.css'

import { Fitter, Fitters, TypeEnum } from '@/entrypoints/content/fitters.ts'
import { getThemeFitInfo, getUserConfig } from '@/entrypoints/content/apis.ts'
import { Config, FittersData } from '@/entrypoints/content/apis.d'
import AppSubmitModal from './AppSubmitModal'
import AppInfoPanel from './AppInfoPanel'
import AppCollector, { useSelectorRender } from './AppCollector'
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

  useLayoutEffect(() => {
    window.document.body.dataset.insurancePlugin = 'PENDING'
    browser.runtime
      .sendMessage({
        action: 'app:init',
      })
      .then((res) => {
        if (res === 'ON') {
          window.document.body.dataset.insurancePlugin = 'ON'
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
    }).toString()

    const [resConfig, resThemeInfo] = await Promise.all([
      getUserConfig(shopify.shop),
      getThemeFitInfo(queryString),
    ])
    if (!resConfig || !resThemeInfo) return
    setUserConfig(resConfig.data)

    setFitterRes(resThemeInfo.data)
    if (resThemeInfo.data.user) {
      setUserFitter(resThemeInfo.data.user)
    }
    if (resConfig.data.isFit !== 2 && resConfig.data.isLocalFit) {
      // TODO: 插入测试脚本
    }
  }

  // 是否适配中
  const isFitting = userConfig && !userConfig.isLocalFit

  // TODO: 这里逻辑复杂化了，其实直接用userFitter就好了，主题那块的逻辑全部由后端处理
  const { getMatched, getValue, getColor } = useMemo(() => {
    return new Fitters(userFitter, undefined)
  }, [userFitter])

  useSelectorRender({
    userFitter,
    isShow: !!isFitting,
    getColor: getColor,
    getMatched: getMatched,
    getValue: getValue,
  })

  const [showModal, setShowModal] = useState(false)

  if (!shopifyInfo || !userConfig) return null
  return (
    <div
      style={{
        all: 'initial',
      }}
    >
      <AppInfoPanel
        shopifyInfo={shopifyInfo}
        userConfig={userConfig}
        userFitter={userFitter}
        fitterRes={fitterRes}
      />

      {isFitting && (
        <AppSubmitModal
          showModal={showModal}
          setShowModal={setShowModal}
          userFitter={userFitter}
          setUserFitter={setUserFitter}
          shopifyInfo={shopifyInfo}
          themeFitter={fitterRes.theme}
          getColor={getColor}
          getMatched={getMatched}
        />
      )}

      {isFitting && (
        <AppCollector
          userFitter={userFitter}
          setUserFitter={setUserFitter}
          getValue={getValue}
        />
      )}

      <Toast />
    </div>
  )
}
export default App

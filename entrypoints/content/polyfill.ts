import {
  setCaptainThemeConfig,
  setThemeConfig,
  getThemeFitInfo,
  getCaptainThemeFitInfo,
  setLocalFit,
} from './apis'
import { AppTypeEnum, FitStatusEnum } from './constants'
import { TypeEnum } from './fitters'
import { getShopifyInfo } from './getShopifyInfo'
import { checkedScriptKeywords } from './util'

interface PolyfillApi {
  submit: typeof setThemeConfig
  getFitter: typeof getThemeFitInfo
  isEmbed: () => boolean
  beforeChangeStatus: (status: FitStatusEnum,oldStatus?:FitStatusEnum) => Promise<any>
}

const polyfillStrategy: Record<AppTypeEnum, PolyfillApi> = {
  [AppTypeEnum.PP]: {
    async submit(params) {
      if (params.type === TypeEnum.FakeUpdate) {
        setCaptainThemeConfig(params)
      }
      return await setThemeConfig(params)
    },
    getFitter: getThemeFitInfo,
    isEmbed: () => checkedScriptKeywords('ins-theme-app'),
    beforeChangeStatus: async (status: FitStatusEnum) => {
      const isLocalFit = status === FitStatusEnum.checking
      await setLocalFit({
        storeName: getShopifyInfo().shop,
        isLocalFit: isLocalFit,
      })
    },
  },
  [AppTypeEnum.Captain]: {
    async submit(params) {
      if (params.type === TypeEnum.PartialRender) {
        setThemeConfig(params)
      }
      return await setCaptainThemeConfig(params)
    },
    getFitter: getCaptainThemeFitInfo,
    isEmbed: () => checkedScriptKeywords('captain'),
    beforeChangeStatus: async () => {},
  },
}

export const polyfill = new Proxy(polyfillStrategy, {
  get(target, p) {
    return target[window.__CurrentApp][p]
  },
}) as unknown as PolyfillApi

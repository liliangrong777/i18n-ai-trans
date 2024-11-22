import {
  setCaptainThemeConfig,
  setThemeConfig,
  getThemeFitInfo,
  getCaptainThemeFitInfo,
  setLocalFit,
  setIsFit,
} from './apis'
import { AppTypeEnum, CIKey, FitStatusEnum, PPKey } from './constants'
import { TypeEnum } from './fitters'
import { getShopifyInfo } from './getShopifyInfo'
import { checkedScriptKeywords } from './util'

interface PolyfillApi {
  submit: typeof setThemeConfig
  getFitter: typeof getThemeFitInfo
  isEmbed: () => boolean
  beforeChangeStatus: (
    status: FitStatusEnum,
    oldStatus?: FitStatusEnum,
    ctx?: any
  ) => Promise<any>
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
    isEmbed: () => checkedScriptKeywords(PPKey),
    beforeChangeStatus: async (status, oldStatus, ctx) => {
      const shop = getShopifyInfo().shop
      const arr: Promise<any>[] = []

      // 处理checking变化逻辑
      if (
        oldStatus === FitStatusEnum.checking ||
        status === FitStatusEnum.checking
      ) {
        arr.push(
          setLocalFit({
            storeName: shop,
            isLocalFit: status === FitStatusEnum.checking,
          })
        )
      }

      // 只有首次适配的时候会调用setIsFit接口
      if (status === FitStatusEnum.published && !ctx.isFit) {
        arr.push(
          setIsFit({
            storeName: shop,
            isFit: true,
          })
        )
      }

      await Promise.all(arr)
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
    isEmbed: () => checkedScriptKeywords(CIKey),
    beforeChangeStatus: async () => {},
  },
}

export const polyfill = new Proxy(polyfillStrategy, {
  get(target, p) {
    return target[window.__CurrentApp][p]
  },
}) as unknown as PolyfillApi

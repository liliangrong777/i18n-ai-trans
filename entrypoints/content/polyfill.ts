import {
  setCaptainThemeConfig,
  setThemeConfig,
  getThemeFitInfo,
  getCaptainThemeFitInfo,
  setLocalFit,
  setIsFit,
  getUserConfig,
  getCaptainUserConfig,
} from './apis'
import {
  AppTypeEnum,
  CIKey,
  FitStatusEnum,
  PPKey,
  StorageKey,
} from './constants'
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
  getInfo: (shop: string) => Promise<{
    isFit?: boolean
    isEnable: boolean
    isLocalFit?: boolean
    status: FitStatusEnum
  } | null>
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
    async getInfo(shop) {
      const res = await getUserConfig(shop)

      if (!res || res.code !== 200) return null
      const { isEnable, isFit, isLocalFit } = res.data
      const storageStatus = window.sessionStorage.getItem(StorageKey.status)

      return {
        isEnable,
        isFit: isFit === 2,
        isLocalFit,
        status: storageStatus
          ? +storageStatus
          : isLocalFit
            ? FitStatusEnum.checking
            : isFit
              ? FitStatusEnum.published
              : FitStatusEnum.fitting,
      }
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
    async getInfo(shop) {
      const res = await getCaptainUserConfig(shop)

      const storageStatus = window.sessionStorage.getItem(StorageKey.status)
      return {
        isEnable: res?.data?.tm_is_enable == 1,
        status: storageStatus ? +storageStatus : FitStatusEnum.published,
      }
    },
  },
}

export const polyfill = new Proxy(polyfillStrategy, {
  get(target, p) {
    return target[window.__CurrentApp][p]
  },
}) as unknown as PolyfillApi

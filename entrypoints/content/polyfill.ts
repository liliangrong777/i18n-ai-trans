import {
  setCaptainThemeConfig,
  setThemeConfig,
  getThemeFitInfo,
  getCaptainThemeFitInfo,
} from './apis'
import { AppTypeEnum } from './constants'
import { TypeEnum } from './fitters'
import { checkedScriptKeywords } from './util'

interface PolyfillApi {
  submit: typeof setThemeConfig
  getFitter: typeof getThemeFitInfo
  isEmbed: () => boolean
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
  },
}

export const polyfill = polyfillStrategy[window.__CurrentApp]

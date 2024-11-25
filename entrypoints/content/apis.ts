import { Result, FittersData, ThemeConfig, Config, LocalFit } from './apis.d'
import { fetchWrap } from './util'

const headers = () => {
  const key = 'X-Plug-Token'
  return {
    'content-type': 'application/json',
    [key]: '265159f3e2c7b90a1ce4b2993f04cb4b',
  }
}

export function getUserConfig(storeName) {
  return fetchWrap<Result<Config>>(
    fetch(
      `${import.meta.env.VITE_BASE_URL}/api/v1/getConfig?storeName=${storeName}`,
      {
        headers: { 'content-type': 'application/json' },
        method: 'get',
      }
    )
  )
}
export function getCaptainUserConfig(storeName) {
  return fetchWrap<Result<any>>(
    fetch(
      `${import.meta.env.VITE_CAPTAIN_URL}/api/v1/getCartSettingByShopUrl?shop_url=${storeName}`,
      {
        headers: { 'content-type': 'application/json' },
        method: 'get',
      }
    )
  )
}

export function getThemeFitInfo(config) {
  return fetchWrap<Result<FittersData>>(
    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/themeFitInfo?${config}`, {
      headers: { 'content-type': 'application/json' },
      method: 'get',
    })
  )
}
export function getCaptainThemeFitInfo(config) {
  return fetchWrap<Result<FittersData>>(
    fetch(`${import.meta.env.VITE_CAPTAIN_URL}/api/v1/themeFitInfo?${config}`, {
      headers: { 'content-type': 'application/json' },
      method: 'get',
    })
  )
}

export function setThemeConfig(config: ThemeConfig) {
  return fetchWrap<Result<FittersData>>(
    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/setThemeConfig`, {
      headers: headers(),
      method: 'POST',
      body: JSON.stringify(config),
    })
  )
}

export function setCaptainThemeConfig(config: ThemeConfig) {
  return fetchWrap<Result<FittersData>>(
    fetch(`${import.meta.env.VITE_CAPTAIN_URL}/api/v1/setThemeConfig`, {
      headers: headers(),
      method: 'POST',
      body: JSON.stringify(config),
    })
  )
}

export function setLocalFit(config: LocalFit) {
  return fetchWrap<Result<FittersData>>(
    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/setLocalFit`, {
      headers: headers(),
      method: 'POST',
      body: JSON.stringify(config),
    })
  )
}

export function setIsFit(config: { storeName: string; isFit: boolean }) {
  return fetchWrap<Result<FittersData>>(
    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/setIsFit`, {
      headers: headers(),
      method: 'POST',
      body: JSON.stringify(config),
    })
  )
}

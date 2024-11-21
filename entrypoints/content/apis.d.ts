import { Fitter, TypeEnum } from './fitters'

export { Fitter, TypeEnum }

export interface Result<T = any> {
  data: T
  code: number
}

export interface FittersData {
  theme?: Fitter
  user?: Fitter
  theme_name: string
}

export interface ThemeConfig extends Fitter {
  themeId: string
  storeName: string
  themeName: string
}

export interface Quotes {
  price: number
  productId: string
  quoteId: string
  symbol: string
  variantsId: string
  status: string
  // TODO: 新增currency
  currency: string
}

export interface UpdateParams {
  updates: Record<string, string>
  sections: string
  attributes: Record<string, any>
}

export interface Config {
  symbol: string
  currency: string
  isFit: number
  productId: string
  variants: string
  defaultDisplayStatus: number
  isEnable: boolean
  storeName: string
  // 主要用于插件，当值为1时开启mock环境
  isLocalFit: boolean
  // 用户自定义样式
  customStyle: string
}

export interface CartData {
  token: string
  currency: string
  total_price: number
  item_count: number
  items: CartDataItem[]
  [x: string]: any
}

export interface CartDataItem {
  id: number
  quantity: number
  variant_id: number
  key: string
  [x: string]: any
}

export interface LocalFit {
  storeName: string
  isLocalFit: boolean
}

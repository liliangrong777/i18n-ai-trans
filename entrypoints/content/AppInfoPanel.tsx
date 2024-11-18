import { ShopifyInfo } from './getShopifyInfo'
import '@/assets/main.css'

import { Config } from './apis.d'
import Panel from '@/components/Panel.tsx'
import { pcopy } from '@/utils/utils.ts'
import { setIsFit, setLocalFit } from '@/entrypoints/content/apis.ts'
import { Fitter } from '@/entrypoints/content/fitters.ts'

interface AppInfoPanelProps {
  shopifyInfo: ShopifyInfo
  userConfig: Config
  userFitter: Fitter
  themeName: string
}
const AppInfoPanel = (props: AppInfoPanelProps) => {
  const { shopifyInfo, userConfig, userFitter, themeName } = props
  const [isPanelShow, setIsPanelShow] = useState(true)

  return (
    <Panel
      open={isPanelShow}
      onClose={() => {
        setIsPanelShow(false)
      }}
    >
      <div className={'mb-4 text-base font-semibold'}>
        {userFitter.type === 1 ? 'Option one' : 'Option two'}
        {userFitter.type === 1 && userFitter.isRefreshCartPage
          ? ' (Refresh cart page)'
          : ''}
      </div>

      <div>
        Shop:{' '}
        <strong
          className={'cursor-copy'}
          onClick={() => {
            pcopy(shopifyInfo.shop)
          }}
        >
          {shopifyInfo.shop}
        </strong>
      </div>
      <div>
        Theme:
        <strong
          className={'cursor-copy'}
          onClick={() => {
            pcopy(themeName)
          }}
        >
          {themeName}
        </strong>
      </div>
      <div>
        IsInstalledPlugin:{' '}
        <strong>{shopifyInfo.isInstalledInsurance ? 'YES' : 'NO'}</strong>
      </div>
      <div>
        IsEnable:{' '}
        <strong
          style={{
            color: userConfig?.isEnable ? 'green' : 'red',
          }}
        >
          {userConfig?.isEnable ? 'YES' : 'NO'}
        </strong>
      </div>
      <div className="flex items-center gap-1">
        IsLocalFit:{' '}
        <input
          type="checkbox"
          checked={userConfig.isLocalFit}
          onClick={async (e) => {
            e.stopPropagation()
            e.preventDefault()
            const res = await setLocalFit({
              storeName: shopifyInfo.shop,
              isLocalFit: !userConfig.isLocalFit,
            })

            if (res) {
              window.location.reload()
            }
          }}
          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-1">
        IsFit:{' '}
        <input
          type="checkbox"
          disabled={userConfig.isFit === 2}
          checked={userConfig.isFit === 2}
          onClick={async (e) => {
            e.stopPropagation()
            e.preventDefault()
            const res = await setIsFit({
              storeName: shopifyInfo.shop,
              isFit: true,
            })
            if (res) {
              window.location.reload()
            }
          }}
          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    </Panel>
  )
}
export default AppInfoPanel

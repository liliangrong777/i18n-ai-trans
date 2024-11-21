import { ShopifyInfo } from './getShopifyInfo'
import '@/assets/main.css'
import { RadioGroup } from '@/components'
import Panel from '@/components/Panel.tsx'
import { pcopy } from '@/utils/utils.ts'
import { setIsFit, setLocalFit } from '@/entrypoints/content/apis.ts'
import { Fitter } from '@/entrypoints/content/fitters.ts'
import { AppTypeEnum, FitStatusEnum } from './constants'
import { polyfill } from './polyfill'

interface AppInfoPanelProps {
  shopifyInfo: ShopifyInfo
  userFitter: Fitter
  themeName: string
  isEnable: boolean
  isLocalFit: boolean
  isFit: boolean
  currentApp: string
  onCurrentAppChange: (v: string) => void
  status: FitStatusEnum
  onStatusChange: (val: FitStatusEnum) => void
}
const AppInfoPanel = (props: AppInfoPanelProps) => {
  const {
    shopifyInfo,
    userFitter,
    themeName,
    currentApp,
    isEnable,
    isLocalFit,
    isFit,
    status,
    onStatusChange,
    onCurrentAppChange,
  } = props
  const [isPanelShow, setIsPanelShow] = useState(true)

  const isEmbed = useMemo(() => {
    return polyfill.isEmbed()
  }, [])

  return (
    <Panel
      open={isPanelShow}
      onClose={() => {
        setIsPanelShow(false)
      }}
    >
      <div className="mb-4">
        <RadioGroup
          options={[
            {
              label: 'PP',
              value: AppTypeEnum.PP,
            },
            {
              label: 'CA',
              value: AppTypeEnum.Captain,
            },
          ]}
          value={currentApp}
          onChange={function (v: any): void {
            onCurrentAppChange(v)
          }}
          label={''}
        />

        <RadioGroup
          options={[
            {
              label: 'fitting',
              value: FitStatusEnum.fitting,
            },
            {
              label: 'checking',
              value: FitStatusEnum.checking,
            },
            {
              label: 'published',
              value: FitStatusEnum.published,
            },
          ]}
          value={status}
          onChange={function (v: any): void {
            onStatusChange(v)
          }}
          label={''}
        />
      </div>
      <div className={'mb-2 text-base font-semibold'}>
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
        <strong
          style={{
            color: isEmbed ? 'green' : 'red',
          }}
        >
          {isEmbed ? 'YES' : 'NO'}
        </strong>
      </div>
      <div>
        IsEnable:{' '}
        <strong
          style={{
            color: isEnable ? 'green' : 'red',
          }}
        >
          {isEnable ? 'YES' : 'NO'}
        </strong>
      </div>
      {currentApp === 'P' && (
        <>
          <div className="flex items-center gap-1">
            IsLocalFit:{' '}
            <input
              type="checkbox"
              checked={isLocalFit}
              onClick={async (e) => {
                e.stopPropagation()
                e.preventDefault()
                const res = await setLocalFit({
                  storeName: shopifyInfo.shop,
                  isLocalFit: !isLocalFit,
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
              disabled={isFit}
              checked={isFit}
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
        </>
      )}
    </Panel>
  )
}
export default AppInfoPanel

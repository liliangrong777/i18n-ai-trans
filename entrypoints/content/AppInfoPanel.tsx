import { ShopifyInfo } from './getShopifyInfo'
import '@/assets/main.css'
import { RadioGroup } from '@/components'
import Panel from '@/components/Panel.tsx'
import { pcopy } from '@/utils/utils.ts'
import { Fitter, TypeEnum } from '@/entrypoints/content/fitters.ts'
import { AppTypeEnum, FitStatusEnum } from './constants'
import { polyfill } from './polyfill'

interface AppInfoPanelProps {
  shopifyInfo: ShopifyInfo
  userFitter: Fitter
  isEnable: boolean
  currentApp: string
  onCurrentAppChange: (v: string) => void
  status: FitStatusEnum
  initStatus: 'loading' | 'success' | 'error'
  onStatusChange: (val: FitStatusEnum) => void
  onCheckedChange: (val: boolean) => void
}
const AppInfoPanel = (props: AppInfoPanelProps) => {
  const {
    shopifyInfo,
    userFitter,
    currentApp,
    isEnable,
    initStatus,
    status,
    onStatusChange,
    onCurrentAppChange,
    onCheckedChange,
  } = props
  const [isPanelShow, setIsPanelShow] = useState(true)

  const isEmbed = useMemo(() => {
    return polyfill.isEmbed()
  }, [])

  const typeStr = useMemo(() => {
    if (initStatus === 'loading') {
      return 'Querying...'
    }
    if (initStatus === 'error') {
      return 'Error'
    }
    if (userFitter.type === TypeEnum.FakeUpdate) {
      return 'Option two'
    }
    return userFitter.isRefreshCartPage
      ? 'Option one (Refresh cart page)'
      : 'Option one'
  }, [userFitter, initStatus])

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
              label: 'CI',
              value: AppTypeEnum.Captain,
            },
          ]}
          value={currentApp}
          onChange={function (v: any): void {
            onCurrentAppChange(v)
          }}
          label={''}
        />

        {initStatus === 'success' && (
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
        )}
      </div>
      <div className={'mb-2 text-base font-semibold'}>{typeStr}</div>

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
            pcopy(shopifyInfo.themeName)
          }}
        >
          {shopifyInfo.themeName}
        </strong>
      </div>
      <div>
        Theme Version:
        <strong
          className={'cursor-copy'}
          onClick={() => {
            pcopy(shopifyInfo.themeVersion)
          }}
        >
          {shopifyInfo.themeVersion}
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

      {initStatus === 'success' && (
        <>
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
          <div>
            Weight: <strong>{userFitter.weight}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span>isCheckedAndOk: </span>
            <input
              type="checkbox"
              onChange={(e) => {
                const checked = userFitter.weight >= 3
                e.stopPropagation()
                e.preventDefault()
                onCheckedChange(!checked)
              }}
              checked={userFitter.weight >= 3}
            ></input>
          </div>
        </>
      )}
    </Panel>
  )
}
export default AppInfoPanel

import { ShopifyInfo } from './getShopifyInfo'
import '@/assets/main.css'
import { RadioGroup } from '@/components'
import Panel from '@/components/Panel.tsx'
import { pcopy } from '@/utils/utils.ts'
import { Fitter } from '@/entrypoints/content/fitters.ts'
import { AppTypeEnum, FitStatusEnum } from './constants'
import { polyfill } from './polyfill'

interface AppInfoPanelProps {
  shopifyInfo: ShopifyInfo
  userFitter: Fitter
  isEnable: boolean
  currentApp: string
  onCurrentAppChange: (v: string) => void
  status: FitStatusEnum
  onStatusChange: (val: FitStatusEnum) => void
  onCheckedChange: (val: boolean) => void
}
const AppInfoPanel = (props: AppInfoPanelProps) => {
  const {
    shopifyInfo,
    userFitter,
    currentApp,
    isEnable,

    status,
    onStatusChange,
    onCurrentAppChange,
    onCheckedChange,
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
    </Panel>
  )
}
export default AppInfoPanel

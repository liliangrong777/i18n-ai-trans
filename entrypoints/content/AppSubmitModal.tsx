import { Modal, RadioGroup, Button, Input } from '@/components'
import '@/assets/main.css'

import { Fitter, TypeEnum } from './fitters.ts'

import { checkIsCartPage } from './util.ts'
import { ShopifyInfo } from './getShopifyInfo.ts'
import classNames from 'classnames'
import { polyfill } from './polyfill.ts'
interface AppSubmitModalProps {
  shopifyInfo: ShopifyInfo
  userFitter: Fitter
  setUserFitter: React.Dispatch<React.SetStateAction<Fitter>>
}
const AppSubmitModal = (props: AppSubmitModalProps) => {
  const [showModal, setShowModal] = useState(false)
  const { userFitter, setUserFitter, shopifyInfo } = props

  const commonList = [
    {
      key: 'anchor',
      label: 'anchor',
    },
    {
      key: 'position',
      label: 'position',
    },
    {
      key: 'footerUpdateSection',
      label: 'footerUpdateSection',
    },
    {
      key: 'dynamicAnchor',
      label: 'dynamicAnchor',
    },
    {
      key: 'dynamicPosition',
      label: 'dynamicPosition',
    },
    {
      key: 'dynamicFooterUpdateSection',
      label: 'dynamicFooterUpdateSection',
    },
  ]
  const option1List = [
    {
      key: 'sections',
      label: 'sections',
    },
    {
      key: 'updateSection',
      label: 'updateSection',
    },
    {
      key: 'isRefreshCartPage',
      label: 'isRefreshCartPage',
    },
    {
      key: 'ppSeelCartTemplate',
      label: 'ppSeelCartTemplate',
    },
    {
      key: 'dynamicSection',
      label: 'dynamicSection',
    },
    {
      key: 'dynamicUpdateSection',
      label: 'dynamicUpdateSection',
    },
  ]
  const option2List = [
    {
      key: 'submit',
      label: 'submit',
    },
    {
      key: 'dynamicSubmit',
      label: 'dynamicSubmit',
    },
    {
      key: 'isPrevent',
      label: 'isPrevent',
    },
  ]

  const isDelHideList = [
    'anchor',
    'updateSection',
    'dynamicAnchor',
    'footerUpdateSection',
    'dynamicFooterUpdateSection',
    'dynamicSubmit',
    'dynamicUpdateSection',
    'submit',
  ]
  const isUpdateHideList = [
    'isRefreshCartPage',
    'ppSeelCartTemplate',
    'isPrevent',
  ]

  const list = [commonList, option1List, option2List]

  const submitToServer = async () => {
    setShowModal(false)
    // console.log('tijiao')
    const res = await polyfill.submit({
      ...userFitter,
      storeName: shopifyInfo.shop,
      themeId: shopifyInfo.themeId,
      themeName: shopifyInfo.themeName,
    })
    if (res && res.code === 200) {
      window.__showToast('Submit Success!')
    } else {
      window.__showToast('err', false)
    }
  }

  const color = userFitter[checkIsCartPage() ? 'sections' : 'dynamicSection']
    ? 'blue'
    : 'gray'

  function renderItem(key, value) {
    if (isUpdateHideList.includes(key)) {
      return (
        <button
          className="w-full rounded-md shadow-sm shadow-orange-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            setUserFitter({
              ...userFitter,
              [key]: !value,
            })
          }}
        >
          {String(value)}
        </button>
      )
    }
    return (
      <Input
        showText
        label=""
        value={value + ''}
        onChange={function (v) {
          setUserFitter({
            ...userFitter,
            [key]: v,
          })
        }}
      />
    )
  }

  return (
    <>
      <div
        onClick={async (e) => {
          e.stopPropagation()
          setShowModal(true)
        }}
        style={{
          background: color,
        }}
        className="fixed right-0 top-1/2 z-[99999999991] flex h-10 w-10 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-blue-600  p-4 text-white shadow-lg hover:opacity-80"
      >
        I
      </div>
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false)
        }}
      >
        <div className="space-y-6 text-base">
          <div className="space-y-4">
            <RadioGroup
              label="Select"
              value={userFitter.type}
              options={[
                {
                  label: 'Option one',
                  value: TypeEnum.PartialRender,
                },
                {
                  label: 'Option two',
                  value: TypeEnum.FakeUpdate,
                },
              ]}
              onChange={function (v: any) {
                setUserFitter({
                  ...userFitter,
                  type: v,
                })
              }}
            />
            {list.map((li, i) => {
              const isCurrentType = userFitter.type === i
              return (
                <div key={i}>
                  {li.map((info) => {
                    const { key } = info

                    const isHide =
                      (i !== 0 && !isCurrentType) ||
                      (checkIsCartPage()
                        ? [
                            'dynamicAnchor',
                            'dynamicPosition',
                            'dynamicFooterUpdateSection',
                            'dynamicSection',
                            'dynamicUpdateSection',
                            'dynamicSubmit',
                          ].includes(key)
                        : [
                            'anchor',
                            'position',
                            'footerUpdateSection',
                            'sections',
                            'updateSection',
                            'submit',
                          ].includes(key))
                    return (
                      <div
                        key={key}
                        className={classNames(
                          'flex justify-between gap-2 hover:bg-gray-300',
                          {
                            'opacity-20': isHide,
                          }
                        )}
                      >
                        <div className="w-[240px] flex-shrink-0">{key}:</div>
                        <div>{renderItem(key, userFitter[key])}</div>
                        {isDelHideList.includes(key) && userFitter[key] && (
                          <span
                            className={'cursor-pointer'}
                            onClick={() => {
                              setUserFitter({
                                ...userFitter,
                                [key]: '',
                              })
                            }}
                          >
                            {' '}
                            X
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          <Button onClick={submitToServer}>Submit</Button>
        </div>
      </Modal>
    </>
  )
}
export default AppSubmitModal

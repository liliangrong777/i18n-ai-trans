import { useLayoutEffect } from 'react'
import { AppCore } from './core'
import { Modal, RadioGroup, Input, Button } from '@/components'
import '@/assets/main.css'
import { checkIsCartPage, getLimitedSelector } from './util'

import {
  Fitter,
  getMatchedGlobalSelector,
} from '@/entrypoints/content/fitters.ts'
import { MsgEvent } from './constants'

function guessPage() {
  return checkIsCartPage() ? 'cart' : 'drawer'
}

interface AppCollectorProps {
  userFitter: Fitter
  setUserFitter: React.Dispatch<React.SetStateAction<Fitter>>
}
const AppCollector = (props: AppCollectorProps) => {
  const { userFitter, setUserFitter } = props
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState('cart')
  const [type, setType] = useState('anchor')
  const [position, setPosition] = useState<
    'afterbegin' | 'afterend' | 'beforebegin' | 'beforeend'
  >('beforebegin')
  const [selector, setSelector] = useState('')

  useLayoutEffect(() => {
    const app = new AppCore({
      onSelect(v, e) {
        const isShadowRoot = (e.target as any)?.shadowRoot
        if (isShadowRoot) {
          window.__showToast("shadowRoot can't be adapted", false)
          return
        }

        setPage(guessPage())
        setSelector(v)
        setPosition('beforebegin')
        const isPrice = /\d/.test((e.target as any)?.innerText ?? '')
        const type = isPrice ? 'footerUpdateSection' : 'anchor'
        setType(type)
        setOpen(true)
      },
    })
    app.addEventListenersToWindow()
    return () => {
      app.removeEventListenersFromWindow()
    }
  }, [])

  useEffect(() => {
    const fn = async (message) => {
      const { action, data } = message
      if (action === MsgEvent.changeSection && data) {
        setUserFitter({
          ...userFitter,
          [checkIsCartPage() ? 'sections' : 'dynamicSection']: data,
        })
      }
    }
    browser.runtime.onMessage.addListener(fn)
    return () => {
      browser.runtime.onMessage.removeListener(fn)
    }
  }, [setUserFitter, userFitter])

  return (
    <>
      <div
        onClick={async (e) => {
          e.stopPropagation()
          e.preventDefault()
          // 猜测所有fitter
          const matchedGlobalSelectors = getMatchedGlobalSelector()
          const newUserFitter = { ...userFitter }
          Object.keys(matchedGlobalSelectors).forEach((key) => {
            function getKey(key) {
              if (checkIsCartPage()) return key
              return `dynamic${key.replace(key[0], key[0].toUpperCase())}`
            }
            if (!userFitter[key]) {
              const isLimitKey = ['submit', 'anchor'].some((item) =>
                key.includes(item)
              )
              if (isLimitKey) {
                newUserFitter[getKey(key)] = getLimitedSelector(
                  matchedGlobalSelectors[key]
                )
              } else {
                newUserFitter[getKey(key)] = matchedGlobalSelectors[key]
              }
            }
          })
          setUserFitter(newUserFitter)
        }}
        style={{
          top: 'calc(50% - 50px)',
        }}
        className="fixed right-0 z-[9999999999999] flex h-10 w-10 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-blue-600  p-4 text-white shadow-lg hover:opacity-80"
      >
        G
      </div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      >
        <div className="space-y-6 text-base">
          <RadioGroup
            label="Page"
            value={page}
            options={[
              {
                label: 'cart',
                value: 'cart',
              },
              {
                label: 'drawer',
                value: 'drawer',
              },
            ]}
            onChange={function (v) {
              setPage(v)
            }}
          />
          <RadioGroup
            label="Type"
            value={type}
            options={[
              {
                label: 'anchor',
                value: 'anchor',
              },
              {
                label: 'footerUpdateSection',
                value: 'footerUpdateSection',
              },
              {
                label: 'updateSection',
                value: 'updateSection',
              },
              {
                label: 'submit',
                value: 'submit',
              },
            ]}
            onChange={function (v) {
              setType(v)
            }}
          />
          {type === 'anchor' && (
            <RadioGroup
              label="Position"
              value={position}
              options={[
                {
                  label: 'beforebegin',
                  value: 'beforebegin',
                },
                {
                  label: 'afterend',
                  value: 'afterend',
                },
              ]}
              onChange={function (v: any) {
                setPosition(v)
              }}
            />
          )}

          <Input
            showText
            label="Selector"
            value={selector}
            onChange={function (v) {
              setSelector(v)
            }}
          />
          <Button
            onClick={async (e) => {
              e.stopPropagation()
              e.preventDefault()
              if (!selector) return
              if (page === 'cart') {
                setUserFitter({
                  ...userFitter,
                  position: position,
                  [type]: selector,
                })
              } else {
                const str = type.replace(type[0], type[0].toUpperCase())
                setUserFitter({
                  ...userFitter,
                  dynamicPosition: position,
                  [`dynamic${str}`]: selector,
                })
              }

              setOpen(false)
            }}
          >
            Add
          </Button>
          <div>
            <Button
              onClick={async (e) => {
                e.stopPropagation()
                e.preventDefault()
                document.querySelector(selector)?.remove()
                setOpen(false)
              }}
            >
              Remove this mask
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
export default AppCollector

interface useSelectorRenderProps {
  userFitter: Fitter
  isShow: boolean
}
export function useSelectorRender(props: useSelectorRenderProps) {
  const { isShow, userFitter } = props

  const borderStyles = useMemo(
    function () {
      const borderKeys = [
        'footerUpdateSection',
        'dynamicFooterUpdateSection',
        'submit',
        'dynamicSubmit',
        'updateSection',
        'dynamicUpdateSection',
      ] as const

      const styles: string[] = []
      borderKeys.forEach((borderKey) => {
        const item = userFitter[borderKey]
        if (item) {
          styles.push(`
                ${item}{
                    border:3px solid green !important;
                }
        `)
        }
      })

      return styles.join('\r\n')
    },
    [userFitter]
  )

  const rerender = useCallback(
    function () {
      if (!isShow) return
      // 渲染虚拟锚点
      document.querySelectorAll('.insurance-mock-block')?.forEach((item) => {
        item.remove()
      })
      const anchor = userFitter.anchor
      const dynamicAnchor = userFitter.dynamicAnchor
      const dynamicPosition = userFitter.dynamicPosition
      const position = userFitter.position
      function createPlaceholder(anchor, position) {
        const nodes = document.querySelectorAll(anchor)
        nodes.forEach((item) => {
          item.insertAdjacentHTML(
            position,
            `<div class="insurance-mock-block" style="padding: 20px 50px; background: green; color:#fff;">insurance mock block</div>`
          )
        })
      }
      if (dynamicPosition === position) {
        const selector = [anchor, dynamicAnchor]
          .filter((item) => item && item.trim())
          .join(',')
        if (selector) {
          createPlaceholder(
            selector,
            checkIsCartPage() ? position : dynamicPosition
          )
        }
      } else {
        anchor && createPlaceholder(anchor, position)
        dynamicAnchor &&
          anchor !== dynamicAnchor &&
          createPlaceholder(dynamicAnchor, dynamicPosition)
      }

      // 为已选中的添加样式
      let style = document.getElementById('insurance-border-style')
      if (!style) {
        style = document.createElement('style')
        style.id = 'insurance-border-style'
        document.body.appendChild(style)
      }
      style.innerHTML = borderStyles
    },
    [borderStyles, isShow, userFitter]
  )

  useEffect(() => {
    rerender()
  }, [rerender])

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      rerender()
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [rerender])
}

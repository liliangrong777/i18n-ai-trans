import { findSelect } from './findSelect'
import { getShopifyInfo } from './getShopifyInfo'

enum State {
  IDLE = 'IDLE',
  HOVER = 'HOVER',
}

interface AppCoreProps {
  onSelect: (selector: string, e: MouseEvent) => void
}

export class AppCore {
  private state: State = State.IDLE
  private target: HTMLElement | null = null
  private timer
  private props: AppCoreProps

  constructor(props: AppCoreProps) {
    this.onClick = this.onClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.toggleIndicator = this.toggleIndicator.bind(this)
    this.execFn = this.execFn.bind(this)
    this.props = props
  }

  get shopifyInfo() {
    return getShopifyInfo()
  }

  private async execFn(e: MouseEvent) {
    if (e.altKey) {
      e.stopPropagation()
      e.preventDefault()
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        const selector = findSelect(this.target!)
        this.props.onSelect(selector, e)
      }, 200)
    }
  }

  private onClick(event: MouseEvent) {
    if (this.state === State.HOVER && this.target instanceof HTMLElement) {
      this.state = State.IDLE
      this.toggleIndicator()
      this.execFn(event)
    }
  }

  private toggleIndicator() {
    for (const element of Array.from(
      document.querySelectorAll('[data-click-to-component-target]')
    )) {
      if (element instanceof HTMLElement) {
        delete element.dataset.clickToComponentTarget
      }
    }

    if (this.state === State.IDLE) {
      delete window.document.body.dataset.clickToComponent
      if (this.target) {
        delete this.target.dataset.clickToComponentTarget
      }
      return
    }

    if (this.target instanceof HTMLElement) {
      window.document.body.dataset.clickToComponent = this.state
      this.target.dataset.clickToComponentTarget = this.state
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (this.state) {
      case State.IDLE:
        if (event.altKey) {
          this.state = State.HOVER
          this.toggleIndicator()
        }
        break

      default:
        break
    }
  }

  private onKeyUp() {
    switch (this.state) {
      case State.HOVER:
        this.state = State.IDLE
        this.toggleIndicator()
        break

      default:
        break
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return
    }

    switch (this.state) {
      case State.IDLE:
      case State.HOVER:
        this.target = event.target
        this.toggleIndicator()
        break

      default:
        break
    }
  }

  private onBlur() {
    switch (this.state) {
      case State.HOVER:
        this.state = State.IDLE
        this.toggleIndicator()
        break

      default:
        break
    }
  }

  addEventListenersToWindow() {
    window.addEventListener('mousedown', this.onClick, { capture: true })
    window.addEventListener('click', this.onClick, { capture: true })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('blur', this.onBlur)
  }

  removeEventListenersFromWindow() {
    window.removeEventListener('mousedown', this.onClick, { capture: true })
    window.removeEventListener('click', this.onClick, { capture: true })
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('blur', this.onBlur)
  }
}

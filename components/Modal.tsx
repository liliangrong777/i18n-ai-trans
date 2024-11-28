import { useLayoutEffect } from 'react'

export interface ModalProps {
  open: boolean
  onClose(): void
  children: React.ReactNode
}
export const Modal = (props: ModalProps) => {
  const { open, onClose, children } = props

  const ref = useRef(null)
  useLayoutEffect(() => {
    const fn = (event) => {
      const path = event.composedPath()
      if (path[0] === ref.current) {
        onClose()
      }
    }

    // 点击模态弹窗外部时关闭弹窗
    window.addEventListener('mousedown', fn)
    return () => {
      window.removeEventListener('mousedown', fn)
    }
  }, [onClose])
  return (
    <div
      ref={ref}
      id="modal"
      className={`fixed inset-0 z-[9999999999999] items-center justify-center bg-black bg-opacity-50 ${
        open ? 'flex' : 'hidden'
      }`}
    >
      <div className="w-full max-w-[600px] rounded-lg bg-white p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}

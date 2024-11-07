export interface PanelProps {
  open: boolean
  onClose?(): void
  children: React.ReactNode
}
const Panel = (props: PanelProps) => {
  const { open, children, onClose } = props
  return (
    <div
      id="modal"
      className={`fixed left-0 top-36 z-[999992] items-center justify-center bg-black bg-opacity-50 text-xs ${
        open ? 'flex' : 'hidden'
      }`}
    >
      <div className="w-full max-w-[600px] rounded-lg bg-white p-2 shadow-lg">
        {children}
      </div>

      {!!onClose && (
        <div
          className="absolute -right-2 -top-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-white"
          onClick={() => {
            onClose()
          }}
        >
          X
        </div>
      )}
    </div>
  )
}
export default Panel

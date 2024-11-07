export interface InputProps {
  value: string
  onChange: (v: string) => void
  label: string
  showText?: boolean
}
export const Input = (props: InputProps) => {
  const { label, value, onChange, showText } = props
  const [hideInput, setHideInput] = useState(showText)
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {hideInput && (
        <div
          className="mt-2 min-h-5 min-w-32  cursor-copy text-sm text-gray-700"
          title="Double click to edit"
          onClick={() => {
            pcopy(value)
          }}
          onDoubleClick={() => {
            setHideInput(false)
          }}
        >
          {value}
        </div>
      )}
      {!hideInput && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder=""
        />
      )}
    </div>
  )
}

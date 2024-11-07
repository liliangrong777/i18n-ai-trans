export interface RadioGroupProps {
  options: { label: string; value: any }[]
  value: any
  onChange: (v: any) => void
  label: string
}
export const RadioGroup = (props: RadioGroupProps) => {
  const { label, options, value, onChange } = props
  return (
    <div>
      <p className="block text-sm font-medium text-gray-700">{label}</p>
      <div className="mt-2 flex space-x-4">
        {options.map((item) => {
          return (
            <div
              className="flex cursor-pointer items-center"
              key={item.value}
              onClickCapture={() => {
                onChange(item.value)
              }}
            >
              <input
                type="radio"
                key={item.value}
                checked={value === item.value}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

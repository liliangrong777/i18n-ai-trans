export interface CheckboxGroupProps {
  options: { label: string; value: string }[]
  value: string[]
  onChange: (v: string[]) => void
  label: string
}
export const CheckboxGroup = (props: CheckboxGroupProps) => {
  const { options, value, label, onChange } = props
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
                if (value.includes(item.value)) {
                  onChange(value.filter((v) => v !== item.value))
                } else {
                  onChange([...value, item.value])
                }
              }}
            >
              <input
                type="checkbox"
                checked={value.includes(item.value)}
                value={item.value}
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

export interface SelectProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  label: string
}
export const Select = (props: SelectProps) => {
  const { label, options, value, onChange } = props
  return (
    <div>
      <label
        htmlFor="country"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id="country"
        name="country"
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      >
        {options.map((item) => {
          return (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          )
        })}
      </select>
    </div>
  )
}

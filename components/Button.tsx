import React from 'react'

export interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLDivElement> | undefined
  children: React.ReactNode
}
export const Button = (props: ButtonProps) => {
  return (
    <div onClick={props.onClick}>
      <button className="w-full rounded-md bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        {props.children}
      </button>
    </div>
  )
}

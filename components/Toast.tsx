import React, { useState } from 'react'

export const Toast = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    window.__showToast = (message: string, success = true) => {
      setToastMessage(message)
      setIsSuccess(success)
      setTimeout(() => {
        setToastMessage(null)
      }, 3000)
    }
  }, [])

  return (
    <div>
      {toastMessage && (
        <div
          className={`fixed right-4 top-4 z-[999999] rounded p-4 shadow ${
            isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  )
}

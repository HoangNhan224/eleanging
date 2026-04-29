/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState, useEffect } from 'react'

export default function useDebounce<T = any> (value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

"use client"

import { useState, useEffect } from "react"

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = () => setMatches(mediaQuery.matches)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Add listener
    mediaQuery.addEventListener("change", handleChange)

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [query])

  return matches
}

export default useMediaQuery


"use client"

import { useState, useEffect } from "react"

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Create the media query list
    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Define the change handler
    const handleChange = (event) => {
      setMatches(event.matches)
    }

    // Add listener with modern API
    try {
      mediaQuery.addEventListener("change", handleChange)
    } catch (err) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      try {
        mediaQuery.removeEventListener("change", handleChange)
      } catch (err) {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query])

  // Return false on the server to avoid hydration mismatch
  return mounted ? matches : false
}

export default useMediaQuery


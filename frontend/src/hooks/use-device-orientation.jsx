"use client"

import { useState, useEffect } from "react"

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })
  const [permission, setPermission] = useState("unknown")

  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission()
        setPermission(permissionState)
        return permissionState
      } catch (error) {
        console.error("Error requesting device orientation permission:", error)
        setPermission("denied")
        return "denied"
      }
    } else {
      setPermission("granted")
      return "granted"
    }
  }

  useEffect(() => {
    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      })
    }

    if (permission === "granted") {
      window.addEventListener("deviceorientation", handleOrientation)
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [permission])

  return { orientation, permission, requestPermission }
}

export default useDeviceOrientation


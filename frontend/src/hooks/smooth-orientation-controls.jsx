"use client"

import { useEffect, useRef } from "react"
import { useDeviceOrientation } from "./use-device-orientation"


export const SmoothOrientationControls = ({ onOrientationChange, vrMode }) => {
  const { orientation, permission, requestPermission } = useDeviceOrientation()
  const initialOrientation = useRef<{ alpha, beta,gamma } | null>(null)
  const calibrating = useRef(false)

  // Request permission when entering VR mode
  useEffect(() => {
    if (vrMode) {
      requestPermission()
    }
  }, [vrMode, requestPermission])

  // Handle calibration with double tap
  useEffect(() => {
    let lastTap = 0

    const handleDoubleTap = () => {
      const now = Date.now()
      const timeDiff = now - lastTap

      if (timeDiff < 300 && timeDiff > 0) {
        // Double tap detected - recalibrate
        initialOrientation.current = null
        calibrating.current = true

        // Reset calibration flag after a short delay
        setTimeout(() => {
          calibrating.current = false
        }, 300)
      }

      lastTap = now
    }

    if (vrMode) {
      document.addEventListener("touchend", handleDoubleTap)
    }

    return () => {
      document.removeEventListener("touchend", handleDoubleTap)
    }
  }, [vrMode])

  // Process orientation data with improved mapping
  useEffect(() => {
    if (!vrMode || permission !== "granted" || calibrating.current) return

    // Store initial orientation for calibration
    if (!initialOrientation.current && orientation.alpha !== 0) {
      initialOrientation.current = { ...orientation }
      return
    }

    if (!initialOrientation.current) return

    // Calculate relative orientation from initial position
    const relativeAlpha = orientation.alpha - initialOrientation.current.alpha
    const relativeBeta = orientation.beta - initialOrientation.current.beta
    const relativeGamma = orientation.gamma - initialOrientation.current.gamma

    // Constrain values to reasonable ranges
    const maxBeta = 45 // max tilt up/down
    const maxGamma = 45 // max tilt left/right

    // Normalize to -1 to 1 range
    const betaNormalized = Math.max(-1, Math.min(1, relativeBeta / maxBeta))
    const gammaNormalized = Math.max(-1, Math.min(1, relativeGamma / maxGamma))

    // Enhanced mapping for VR mode with better sensitivity
    const vrSensitivity = 2.0
    onOrientationChange({
      x: gammaNormalized * 8 * vrSensitivity,
      y: 1.5 - betaNormalized * 1 * vrSensitivity,
      z: 5 - Math.abs(betaNormalized) * 3 * vrSensitivity,
    })
  }, [orientation, vrMode, permission, onOrientationChange])

  return null
}

export default SmoothOrientationControls


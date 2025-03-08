"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  Environment,
  Text,
  OrbitControls,
  Stars,
  Sparkles,
  Float,
  useTexture,
  PerspectiveCamera,
  MeshReflectorMaterial,
  ContactShadows,
} from "@react-three/drei"
import * as THREE from "three"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Progress } from "../ui/progress"
import { Slider } from "../ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Switch } from "../ui/switch"
import {
  Activity,
  Fullscreen,
  Mic,
  MicOff,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Timer,
  Users,
  Volume2,
  VolumeX,
  X,
  Eye,
  EyeOff,
  Headphones,
  ChevronUp,
} from "lucide-react"
import { useMediaQuery } from "../../hooks/use-media-query"
import { cn } from "../../lib/utils"
import { SmoothOrientationControls } from "../../hooks/smooth-orientation-controls"

// Realistic PBR Textures from public URLs
const TEXTURE_URLS = {
  // Wood textures
  woodDark: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/wood_table_001/wood_table_001_diff_4k.jpg",
    normalMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/wood_table_001/wood_table_001_nor_gl_4k.jpg",
    roughnessMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/wood_table_001/wood_table_001_rough_4k.jpg",
  },
  woodLight: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/wood_planks_oak/wood_planks_oak_diff_4k.jpg",
    normalMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/wood_planks_oak/wood_planks_oak_nor_gl_4k.jpg",
    roughnessMap:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/wood_planks_oak/wood_planks_oak_rough_4k.jpg",
  },
  // Metal textures
  metal: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/metal_plate/metal_plate_diff_4k.jpg",
    normalMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/metal_plate/metal_plate_nor_gl_4k.jpg",
    roughnessMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/metal_plate/metal_plate_rough_4k.jpg",
    metalnessMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/metal_plate/metal_plate_metal_4k.jpg",
  },
  // Wall textures
  wall: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/plaster_wall_02/plaster_wall_02_diff_4k.jpg",
    normalMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/plaster_wall_02/plaster_wall_02_nor_gl_4k.jpg",
    roughnessMap:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/plaster_wall_02/plaster_wall_02_rough_4k.jpg",
  },
  // Floor textures
  floor: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/marble_01/marble_01_diff_4k.jpg",
    normalMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/marble_01/marble_01_nor_gl_4k.jpg",
    roughnessMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/marble_01/marble_01_rough_4k.jpg",
  },
  // Fabric textures
  fabric: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/fabric_07/fabric_07_diff_4k.jpg",
    normalMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/fabric_07/fabric_07_nor_gl_4k.jpg",
    roughnessMap: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/fabric_07/fabric_07_rough_4k.jpg",
  },
  // Skin textures (stylized for avatars)
  skin: {
    map: "https://images.unsplash.com/photo-1560780552-ba54683cb263?q=80&w=1000&auto=format&fit=crop",
  },
  screen: {
    map: "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/concrete_wall_007/concrete_wall_007_diff_4k.jpg",
    normalMap:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/concrete_wall_007/concrete_wall_007_nor_gl_4k.jpg",
    roughnessMap:
      "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/concrete_wall_007/concrete_wall_007_rough_4k.jpg",
  },
}

// Environment HDRIs
const ENVIRONMENT_HDRIS = {
  conference: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/conference_room_4k.hdr",
  office: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/office_afternoon_4k.hdr",
  sunset: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/sunset_fairway_4k.hdr",
  night: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/moonless_golf_4k.hdr",
}

// Textures loader with error handling and repeating
const TexturedMaterial = ({ textureSet, color = 0xffffff, repeat = [1, 1], ...props }) => {
  const textures = useTexture(
    {
      map: textureSet.map,
      normalMap: textureSet.normalMap,
      roughnessMap: textureSet.roughnessMap,
      metalnessMap: textureSet.metalnessMap,
      aoMap: textureSet.aoMap,
    },
    (textures) => {
      // Configure all loaded textures
      Object.values(textures).forEach((texture) => {
        if (!texture) return
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(repeat[0], repeat[1])
      })
    },
  )

  // Filter out undefined textures
  const validTextures = Object.fromEntries(Object.entries(textures).filter(([_, texture]) => texture !== undefined))

  return <meshStandardMaterial color={color} {...validTextures} {...props} />
}

// Enhanced floor with realistic material
const Floor = ({ color = "#ffffff", environmentPreset }) => {
  const repeatScale = [8, 8]

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={color}
        metalness={0.5}
        mirror={0.5}
      >
        <TexturedMaterial textureSet={TEXTURE_URLS.floor} repeat={repeatScale} attach="material" />
      </MeshReflectorMaterial>
      <ContactShadows position={[0, 0, 0]} opacity={0.75} scale={100} blur={2} far={10} />
    </mesh>
  )
}

// Enhanced wall with texture
const Wall = ({ position, rotation, size = [30, 10], color = "#f5f5f5" }) => {
  const repeatScale = [4, 2]

  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <TexturedMaterial textureSet={TEXTURE_URLS.wall} color={color} repeat={repeatScale} />
    </mesh>
  )
}

// Enhanced audience member with better geometry and animations
const AudienceMember = ({ position, emotion = "neutral", lookAt }) => {
  const modelRef = useRef()
  const headRef = useRef()
  const bodyRef = useRef()
  const [animationIndex, setAnimationIndex] = useState(0)

  // Textures for different emotions
  const textures = {
    interested: "#88ccff",
    bored: "#ffaa88",
    challenging: "#ff8888",
    friendly: "#88ff88",
    neutral: "#cccccc",
  }

  // Set up the audience member with animation timing
  useEffect(() => {
    setAnimationIndex(Math.floor(Math.random() * 3))
  }, [])

  // Make audience members look at speaker and add subtle animations
  useFrame(({ clock }) => {
    if (modelRef.current && lookAt) {
      // Look at the speaker
      const direction = new THREE.Vector3()
      direction.subVectors(lookAt, modelRef.current.position)
      modelRef.current.lookAt(lookAt)

      // Add subtle movement based on emotion
      const time = clock.getElapsedTime()
      const offset = animationIndex * 2.1 // Offset to make each person's animation different

      if (emotion === "interested" || emotion === "friendly") {
        // Nodding head movement
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(time * 0.5 + offset) * 0.05
        }
        // Subtle body movement
        if (bodyRef.current) {
          bodyRef.current.position.y = Math.sin(time * 0.3 + offset) * 0.02
        }
      } else if (emotion === "bored") {
        // Slight swaying
        modelRef.current.rotation.z = Math.sin(time * 0.2 + offset) * 0.03
        // Drooping head
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(time * 0.1 + offset) * 0.02 - 0.1
        }
      } else if (emotion === "challenging") {
        // Head shaking
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(time * 0.7 + offset) * 0.1
        }
        // Arms crossing effect
        if (bodyRef.current) {
          bodyRef.current.rotation.x = Math.sin(time * 0.2 + offset) * 0.02
        }
      } else {
        // Neutral idle animation
        if (bodyRef.current) {
          bodyRef.current.position.y = Math.sin(time * 0.2 + offset) * 0.01
        }
      }
    }
  })

  // Add some randomness to make audience look more natural
  const randomScale = useMemo(() => 0.5 + (Math.random() * 0.1 - 0.05), [])
  const randomRotation = useMemo(() => Math.random() * 0.2 - 0.1, [])

  // Get color based on emotion
  const getEmotionColor = () => textures[emotion] || textures.neutral

  const bodyColor = ["#3a3a3a", "#2a2a2a", "#4a4a4a", "#5a5a5a"][Math.floor(Math.random() * 4)]
  const headColor = getEmotionColor()

  return (
    <group
      ref={modelRef}
      position={position}
      rotation={[0, randomRotation, 0]}
      scale={[randomScale, randomScale, randomScale]}
    >
      {/* Body */}
      <group ref={bodyRef}>
        <mesh castShadow position={[0, 0.6, 0]}>
          <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
          <TexturedMaterial
            textureSet={TEXTURE_URLS.fabric}
            color={bodyColor}
            roughness={0.6}
            metalness={0.1}
            repeat={[1, 1]}
          />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.3, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.5, 8, 16]} />
          <TexturedMaterial
            textureSet={TEXTURE_URLS.fabric}
            color={bodyColor}
            roughness={0.6}
            metalness={0.1}
            repeat={[1, 1]}
          />
        </mesh>

        <mesh position={[0.3, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.5, 8, 16]} />
          <TexturedMaterial
            textureSet={TEXTURE_URLS.fabric}
            color={bodyColor}
            roughness={0.6}
            metalness={0.1}
            repeat={[1, 1]}
          />
        </mesh>
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 1.1, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color={headColor} emissive={headColor} emissiveIntensity={0.1} roughness={0.4} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.08, 0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </mesh>

        <mesh position={[0.08, 0.05, 0.15]} castShadow>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </mesh>

        {/* Mouth - changes based on emotion */}
        {emotion === "friendly" && (
          <mesh position={[0, -0.08, 0.15]} rotation={[0.1, 0, 0]}>
            <torusGeometry args={[0.05, 0.01, 16, 16, Math.PI]} />
            <meshStandardMaterial color="#cc6666" />
          </mesh>
        )}

        {emotion === "challenging" && (
          <mesh position={[0, -0.08, 0.15]} rotation={[Math.PI + 0.1, 0, 0]}>
            <torusGeometry args={[0.05, 0.01, 16, 16, Math.PI]} />
            <meshStandardMaterial color="#cc6666" />
          </mesh>
        )}

        {(emotion === "neutral" || emotion === "interested" || emotion === "bored") && (
          <mesh position={[0, -0.08, 0.15]}>
            <boxGeometry args={[0.07, 0.01, 0.01]} />
            <meshStandardMaterial color="#cc6666" />
          </mesh>
        )}
      </group>

      {/* Emotion indicator - subtle glow */}
      <pointLight position={[0, 1.1, 0]} distance={0.5} intensity={0.5} color={headColor} />
    </group>
  )
}

// Enhanced chair with better geometry and materials
const Chair = ({ position }) => {
  return (
    <group position={position}>
      {/* Chair seat */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <TexturedMaterial textureSet={TEXTURE_URLS.woodDark} color="#331a00" roughness={0.9} repeat={[0.5, 0.5]} />
      </mesh>

      {/* Chair back */}
      <mesh castShadow receiveShadow position={[0, 0.65, -0.25]}>
        <boxGeometry args={[0.6, 0.7, 0.1]} />
        <TexturedMaterial textureSet={TEXTURE_URLS.woodDark} color="#331a00" roughness={0.9} repeat={[0.5, 0.5]} />
      </mesh>

      {/* Chair legs */}
      <mesh castShadow position={[-0.25, 0.05, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.metal}
          color="#222222"
          metalness={0.8}
          roughness={0.2}
          repeat={[0.2, 0.2]}
        />
      </mesh>
      <mesh castShadow position={[0.25, 0.05, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.metal}
          color="#222222"
          metalness={0.8}
          roughness={0.2}
          repeat={[0.2, 0.2]}
        />
      </mesh>
      <mesh castShadow position={[-0.25, 0.05, -0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.metal}
          color="#222222"
          metalness={0.8}
          roughness={0.2}
          repeat={[0.2, 0.2]}
        />
      </mesh>
      <mesh castShadow position={[0.25, 0.05, -0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.metal}
          color="#222222"
          metalness={0.8}
          roughness={0.2}
          repeat={[0.2, 0.2]}
        />
      </mesh>
    </group>
  )
}

// Enhanced podium with better materials and details
const Podium = () => {
  return (
    <group position={[0, -0.25, 0]}>
      {/* Main podium body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.8, 0.8]} />
        <TexturedMaterial textureSet={TEXTURE_URLS.woodDark} color="#8B4513" roughness={0.7} repeat={[1, 0.5]} />
      </mesh>

      {/* Decorative trim on podium */}
      <mesh position={[0, 0.41, 0]} castShadow>
        <boxGeometry args={[1.5, 0.02, 0.9]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.metal}
          color="#d4af37"
          metalness={0.9}
          roughness={0.1}
          repeat={[2, 0.1]}
        />
      </mesh>

      {/* Podium front panel with texture */}
      <mesh position={[0, 0, 0.41]} castShadow>
        <planeGeometry args={[1.3, 0.7]} />
        <TexturedMaterial textureSet={TEXTURE_URLS.woodLight} color="#6B3E26" roughness={0.6} repeat={[1, 0.5]} />
      </mesh>

      {/* Microphone */}
      <group position={[0, 0.41, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.5, 16]} />
          <TexturedMaterial
            textureSet={TEXTURE_URLS.metal}
            color="#111111"
            metalness={0.9}
            roughness={0.1}
            repeat={[0.2, 1]}
          />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.03, 32, 32]} />
          <TexturedMaterial
            textureSet={TEXTURE_URLS.metal}
            color="#222222"
            metalness={0.9}
            roughness={0.1}
            repeat={[0.1, 0.1]}
          />
        </mesh>
      </group>
    </group>
  )
}

// Enhanced speaker avatar with better animations and materials
const SpeakerAvatar = ({ recording, speakerColor = "#2a4a8a" }) => {
  const ref = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()

  // Animate the speaker when recording
  useFrame(({ clock }) => {
    if (ref.current && recording) {
      const t = clock.getElapsedTime()

      // Subtle speaking animation
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.1
      ref.current.position.y = Math.sin(t * 2) * 0.02 + 0.7

      // Head movement
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 1.5) * 0.05
        headRef.current.rotation.y = Math.sin(t * 0.7) * 0.1
      }

      // Arm gestures
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 0.8) * 0.2
        leftArmRef.current.rotation.z = Math.PI / 6 + Math.sin(t * 0.5) * 0.1
      }

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 0.8 + 1) * 0.3
        rightArmRef.current.rotation.z = -Math.PI / 6 + Math.sin(t * 0.5 + 1) * 0.15
      }
    }
  })

  return (
    <group position={[0, 0.7, 0]} ref={ref}>
      {/* Speaker body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.25, 0.7, 16, 32]} />
        <TexturedMaterial textureSet={TEXTURE_URLS.fabric} color={speakerColor} roughness={0.7} repeat={[1, 1]} />
      </mesh>

      {/* Speaker head */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <TexturedMaterial textureSet={TEXTURE_URLS.skin} color="#e0c080" roughness={0.5} repeat={[1, 1]} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.08, 0.05, 0.2]} castShadow>
          <sphereGeometry args={[0.04, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.02, 32, 32]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </mesh>

        <mesh position={[0.08, 0.05, 0.2]} castShadow>
          <sphereGeometry args={[0.04, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.02, 32, 32]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </mesh>

        {/* Mouth - changes when speaking */}
        <mesh position={[0, -0.1, 0.2]} castShadow>
          <boxGeometry args={[0.1, recording ? 0.05 : 0.02, 0.01]} />
          <meshStandardMaterial color="#cc6666" />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.26, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
        </mesh>
      </group>

      {/* Arms */}
      <group position={[0, 0.2, 0]}>
        {/* Left arm */}
        <mesh ref={leftArmRef} position={[-0.35, 0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
          <TexturedMaterial textureSet={TEXTURE_URLS.fabric} color={speakerColor} roughness={0.7} repeat={[1, 1]} />
        </mesh>

        {/* Right arm */}
        <mesh ref={rightArmRef} position={[0.35, 0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
          <TexturedMaterial textureSet={TEXTURE_URLS.fabric} color={speakerColor} roughness={0.7} repeat={[1, 1]} />
        </mesh>
      </group>

      {/* Recording indicator */}
      {recording && (
        <>
          <pointLight position={[0, 0.6, 0.3]} distance={0.5} intensity={2} color="red" />
          <Sparkles count={10} scale={1} size={0.5} speed={0.5} color="red" position={[0, 0.8, 0]} />
        </>
      )}
    </group>
  )
}

// Enhanced presentation screen with better materials
const PresentationScreen = ({ topic, notes = [] }) => {
  const screenRef = useRef()

  // Add subtle animation to the screen
  useFrame(({ clock }) => {
    if (screenRef.current) {
      const t = clock.getElapsedTime()
      screenRef.current.material.emissiveIntensity = 0.1 + Math.sin(t * 0.5) * 0.05
    }
  })

  return (
    <group position={[0, 2.5, -9.8]}>
      {/* Screen frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[12.2, 6.2, 0.2]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.metal}
          color="#222222"
          metalness={0.7}
          roughness={0.3}
          repeat={[5, 2]}
        />
      </mesh>

      {/* Screen surface */}
      <mesh ref={screenRef} position={[0, 0, 0.11]}>
        <planeGeometry args={[12, 6]} />
        <TexturedMaterial
          textureSet={TEXTURE_URLS.screen}
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.1}
          roughness={0.1}
          repeat={[3, 1.5]}
        />
      </mesh>

      {/* Display the speech topic on the screen */}
      {topic && (
        <>
          <Text
            position={[0, 2, 0.15]}
            fontSize={0.6}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={10}
            font="/fonts/Geist-Bold.ttf"
          >
            {topic}
          </Text>

          {/* Divider line */}
          <mesh position={[0, 1.5, 0.15]}>
            <boxGeometry args={[8, 0.05, 0.01]} />
            <meshStandardMaterial color="#333333" />
          </mesh>

          {/* Display bullet points if available */}
          {notes.length > 0 && (
            <group position={[0, 0, 0.15]}>
              {notes.map((note, index) => (
                <Text
                  key={index}
                  position={[-4.5, 1 - index * 0.7, 0]}
                  fontSize={0.4}
                  color="#000000"
                  anchorX="left"
                  anchorY="middle"
                  maxWidth={9}
                  font="/fonts/Geist-Regular.ttf"
                >
                  • {note}
                </Text>
              ))}
            </group>
          )}
        </>
      )}
    </group>
  )
}

// Enhanced speech timer with better visuals
const SpeechTimer = ({ duration, position = [0, 2, -3], visible, warningTime = 30 }) => {
  if (!visible) return null

  // Format time as MM:SS
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  // Change color based on remaining time
  const isWarning = duration >= warningTime
  const color = isWarning ? "#ff3333" : "white"
  const pulseIntensity = isWarning ? 1.5 : 0.5

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={pulseIntensity}>
      <group position={position}>
        <Text
          fontSize={0.5}
          color={color}
          anchorX="center"
          anchorY="middle"
          backgroundColor="#00000080"
          padding={0.2}
          font="/fonts/GeistMono-Bold.ttf"
        >
          {timeString}
        </Text>
        {isWarning && <pointLight color="#ff0000" intensity={0.8} distance={2} />}
      </group>
    </Float>
  )
}

// VR stereo effect renderer for a true VR mode
const StereoEffect = ({ children, active }) => {
  const { gl, camera, size } = useThree()
  const [sceneL] = useState(() => new THREE.Scene())
  const [sceneR] = useState(() => new THREE.Scene())

  const [renderTarget] = useState(
    () =>
      new THREE.WebGLRenderTarget(size.width / 2, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        encoding: gl.outputEncoding,
      }),
  )

  // Clone camera for left and right eyes
  const cameraL = useMemo(() => camera.clone(), [camera])
  const cameraR = useMemo(() => camera.clone(), [camera])

  useEffect(() => {
    return () => {
      renderTarget.dispose()
    }
  }, [renderTarget])

  useFrame(() => {
    if (!active) return

    // Set camera eye separation for 3D effect
    const eyeSep = 0.064 // average human eye separation in meters

    // Calculate projection matrices for left and right eyes
    const projMatrixL = camera.projectionMatrix.clone()
    const projMatrixR = camera.projectionMatrix.clone()

    // Create camera matrices for left and right eyes
    const eyeRight = new THREE.Vector3()
    const eyeLeft = new THREE.Vector3()
    const eyeUp = new THREE.Vector3()
    const eyeForward = new THREE.Vector3()

    camera.matrixWorld.extractBasis(eyeRight, eyeUp, eyeForward)
    eyeRight.multiplyScalar(eyeSep / 2)
    eyeLeft.copy(eyeRight).negate()

    // Apply eye separation to camera positions
    cameraL.position.copy(camera.position).add(eyeLeft)
    cameraR.position.copy(camera.position).add(eyeRight)

    cameraL.quaternion.copy(camera.quaternion)
    cameraR.quaternion.copy(camera.quaternion)

    cameraL.projectionMatrix.copy(projMatrixL)
    cameraR.projectionMatrix.copy(projMatrixR)

    // Render left eye view
    gl.setViewport(0, 0, size.width / 2, size.height)
    gl.setScissor(0, 0, size.width / 2, size.height)
    gl.setScissorTest(true)
    gl.render(sceneL, cameraL)

    // Render right eye view
    gl.setViewport(size.width / 2, 0, size.width / 2, size.height)
    gl.setScissor(size.width / 2, 0, size.width / 2, size.height)
    gl.setScissorTest(true)
    gl.render(sceneR, cameraR)
  }, 1)

  return active ? (
    <>
      <scene
        ref={(el) => {
          if (el) Object.assign(sceneL, el)
        }}
      >
        {children}
      </scene>
      <scene
        ref={(el) => {
          if (el) Object.assign(sceneR, el)
        }}
      >
        {children}
      </scene>
    </>
  ) : (
    children
  )
}

// Enhanced virtual room with better audience distribution and materials
const VirtualRoom = ({ audienceSize, audienceMood, environmentPreset, speechTopic, recording, speechNotes = [] }) => {
  // Calculate audience positions
  const positions = useMemo(() => {
    const pos = []

    // Calculate how many rows we need (max 10 people per row)
    const peoplePerRow = Math.min(10, audienceSize)
    const rows = Math.ceil(audienceSize / peoplePerRow)

    let count = 0

    // Create multiple semi-circular rows
    for (let row = 0; row < rows; row++) {
      const rowPeople = Math.min(peoplePerRow, audienceSize - count)
      const rowDistance = 3 + row * 1.5 // Each row is further back

      for (let i = 0; i < rowPeople; i++) {
        // Calculate angle in the semi-circle
        const angle = (Math.PI * i) / (rowPeople - 1 || 1)
        const spreadFactor = 4 + row * 0.5 // Wider spread for back rows
        const x = Math.sin(angle) * spreadFactor
        const z = -Math.cos(angle) * rowDistance - 1
        pos.push([x, 0, z])
        count++
      }
    }

    return pos
  }, [audienceSize])

  // Distribute different emotions among audience members
  const emotions = useMemo(() => {
    return Array(audienceSize)
      .fill()
      .map((_, i) => {
        if (audienceMood === "friendly") {
          return ["friendly", "interested", "neutral"][i % 3]
        } else if (audienceMood === "challenging") {
          return ["challenging", "bored", "neutral"][i % 3]
        } else {
          return ["neutral", "interested", "bored"][i % 3]
        }
      })
  }, [audienceSize, audienceMood])

  // Determine floor and wall textures based on environment
  const getColors = () => {
    switch (environmentPreset) {
      case "city":
        return { floor: "#cccccc", wall: "#e0e0e0" }
      case "sunset":
        return { floor: "#e0c9a3", wall: "#f5e5d5" }
      case "night":
        return { floor: "#333344", wall: "#444455" }
      case "dawn":
      default:
        return { floor: "#ddc9a3", wall: "#f5f5f5" }
    }
  }

  const colors = getColors()

  return (
    <>
      {/* Improved lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

      {/* Enhanced room environment */}
      <Floor color={colors.floor} environmentPreset={environmentPreset} />

      {/* Improved walls */}
      <Wall position={[0, 4, -10]} rotation={[0, 0, 0]} color={colors.wall} />
      <Wall position={[-15, 4, 0]} rotation={[0, Math.PI / 2, 0]} color={colors.wall} />
      <Wall position={[15, 4, 0]} rotation={[0, -Math.PI / 2, 0]} color={colors.wall} />

      {/* Enhanced podium */}
      <Podium />

      {/* Speaker avatar (you) */}
      <SpeakerAvatar recording={recording} />

      {/* Presentation screen */}
      <PresentationScreen topic={speechTopic} notes={speechNotes} />

      {/* Side lights for ambiance */}
      <pointLight position={[-8, 4, -5]} intensity={0.3} color="#ffaa77" />
      <pointLight position={[8, 4, -5]} intensity={0.3} color="#ffaa77" />

      {/* Enhanced audience chairs and people */}
      {positions.map((pos, index) => (
        <Chair key={`chair-${index}`} position={[pos[0], -0.3, pos[2]]} />
      ))}

      {positions.map((pos, index) => (
        <AudienceMember
          key={`person-${index}`}
          position={[pos[0], 0.2, pos[2]]}
          emotion={emotions[index]}
          lookAt={new THREE.Vector3(0, 1, 0)}
        />
      ))}

      {/* Environment-specific decorations */}
      {environmentPreset === "night" && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      {environmentPreset === "sunset" && <pointLight position={[-20, 10, -10]} intensity={1.5} color="#ff7700" />}
      {environmentPreset === "dawn" && <Sparkles count={50} scale={20} size={2} speed={0.3} opacity={0.5} />}
    </>
  )
}

// Enhanced camera controller with smoother transitions
const CameraController = ({ position, target, enableRotation }) => {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3())
  const currentTarget = useRef(new THREE.Vector3())

  useEffect(() => {
    currentPos.current.copy(camera.position)
    currentTarget.current.copy(new THREE.Vector3(target.x, target.y, target.z))
  }, [camera, target])

  useFrame(() => {
    if (!enableRotation) {
      // Smooth camera position transition - improved lerp factor
      currentPos.current.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.05)
      camera.position.copy(currentPos.current)

      // Smooth target transition
      currentTarget.current.lerp(new THREE.Vector3(target.x, target.y, target.z), 0.05)
      camera.lookAt(currentTarget.current)
    }
  })

  return null
}

// Main component with improved UI and controls
const VRSpeechTrainer = () => {
  // State management
  const [recording, setRecording] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [audienceSize, setAudienceSize] = useState(10)
  const [audienceMood, setAudienceMood] = useState("neutral")
  const [speechTopic, setSpeechTopic] = useState("")
  const [speechNotes, setSpeechNotes] = useState([])
  const [speechDuration, setSpeechDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [environmentPreset, setEnvironmentPreset] = useState("dawn")
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 1.5, z: 5 })
  const [cameraTarget, setCameraTarget] = useState({ x: 0, y: 0.5, z: 0 })
  const [activeTab, setActiveTab] = useState("controls")
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [enableOrbitControls, setEnableOrbitControls] = useState(true)
  const [viewMode, setViewMode] = useState("audience") // 'audience', 'speaker', 'top'
  const [vrMode, setVrMode] = useState(false)
  const [speakerColor, setSpeakerColor] = useState("#2a4a8a")
  const [controlsPosition, setControlsPosition] = useState("side") // 'side', 'bottom', 'hidden'

  // Refs
  const intervalRef = useRef(null)
  const canvasRef = useRef()
  const audioRef = useRef(null)
  const notesInputRef = useRef(null)

  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Handle mobile orientation changes with improved sensitivity
  const handleOrientationChange = (newPosition) => {
    if (isMobile && !enableOrbitControls) {
      setCameraPosition((prev) => ({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      }))
    }
  }

  // Play ambient sound with better error handling
  useEffect(() => {
    // Use an online ambient sound source
    const audio = new Audio("https://freesound.org/data/previews/417/417486_5121236-lq.mp3")
    audio.loop = true
    audio.volume = 0.2
    audioRef.current = audio

    if (!muted) {
      audio.play().catch((e) => console.log("Audio autoplay prevented:", e))
    }

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [])

  // Update audio mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
    }
  }, [muted])

  // Start recording speech with proper interval cleanup
  const startSpeech = () => {
    setRecording(true)
    setSpeechDuration(0)
    setFeedback(null)

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Start timer with ref to safely clear later
    intervalRef.current = setInterval(() => {
      setSpeechDuration((prev) => prev + 1)
    }, 1000)

    // Switch to speaker view when starting
    setViewMode("speaker")
    updateCameraForViewMode("speaker")

    // Hide controls on mobile when recording
    if (isMobile) {
      setControlsPosition("hidden")
    }

    // Vibrate device if supported (for mobile)
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
  }

  // End speech, clear timer, and generate feedback
  const endSpeech = () => {
    setRecording(false)

    // Clear timer interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Show controls again
    if (isMobile) {
      setControlsPosition("bottom")
    }

    // Vibrate device if supported (for mobile)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // Generate more detailed AI feedback based on current settings
    setTimeout(() => {
      // Simulated AI feedback with randomized values for demo
      const confidenceBase = Math.floor(Math.random() * 20) + 65 // 65-85 base
      const clarityBase = Math.floor(Math.random() * 20) + 70 // 70-90 base

      // Adjust metrics based on audience size and mood
      const audienceFactor = audienceSize > 10 ? -5 : audienceSize < 5 ? 5 : 0
      const moodFactor = audienceMood === "friendly" ? 5 : audienceMood === "challenging" ? -5 : 0

      setFeedback({
        pacing: Math.min(100, Math.max(50, 75 + moodFactor)),
        clarity: Math.min(100, Math.max(50, clarityBase + audienceFactor)),
        confidence: Math.min(100, Math.max(50, confidenceBase + moodFactor)),
        eyeContact: Math.min(100, Math.max(50, 70 + audienceFactor + moodFactor)),
        tips: [
          speechDuration < 60
            ? "Try to speak for at least 1-2 minutes to fully develop your ideas"
            : "Good speech length, allowing you to cover your topic thoroughly",
          audienceMood === "friendly"
            ? "You connected well with the friendly audience"
            : "Your pacing was appropriate for the content",
          audienceMood === "challenging"
            ? "You handled challenging audience reactions well"
            : "Try to vary your tone more when emphasizing key points",
          Math.random() > 0.5
            ? "Consider using more hand gestures to emphasize points"
            : "Your body language effectively reinforced your message",
          speechTopic.length > 10
            ? `Your explanation of "${speechTopic}" was clear and structured`
            : "Consider preparing a more specific speech topic for better focus",
        ].filter(Boolean),
      })

      // Switch to feedback tab
      setActiveTab("feedback")

      // Return to audience view
      setViewMode("audience")
      updateCameraForViewMode("audience")
    }, 1500)
  }

  // Toggle fullscreen mode with proper error handling
  const toggleFullscreen = () => {
    try {
      if (!isFullscreen && canvasRef.current) {
        if (canvasRef.current.requestFullscreen) {
          canvasRef.current.requestFullscreen()
        } else if (canvasRef.current.webkitRequestFullscreen) {
          canvasRef.current.webkitRequestFullscreen()
        } else if (canvasRef.current.mozRequestFullScreen) {
          canvasRef.current.mozRequestFullScreen()
        } else if (canvasRef.current.msRequestFullscreen) {
          canvasRef.current.msRequestFullscreen()
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    } catch (err) {
      console.error("Fullscreen error:", err)
    }
  }

  // Update camera position based on view mode with smoother transitions
  const updateCameraForViewMode = (mode) => {
    switch (mode) {
      case "speaker":
        setCameraPosition({ x: 0, y: 1.5, z: -5 })
        setCameraTarget({ x: 0, y: 0.5, z: -10 })
        break
      case "audience":
        setCameraPosition({ x: 0, y: 1.5, z: 5 })
        setCameraTarget({ x: 0, y: 0.5, z: 0 })
        break
      case "top":
        setCameraPosition({ x: 0, y: 8, z: 0 })
        setCameraTarget({ x: 0, y: 0, z: 0 })
        break
      default:
        setCameraPosition({ x: 0, y: 1.5, z: 5 })
        setCameraTarget({ x: 0, y: 0.5, z: 0 })
    }
  }

  // Change view mode with improved transitions
  const changeViewMode = (mode) => {
    setViewMode(mode)
    updateCameraForViewMode(mode)
  }

  // Toggle VR mode with improved settings
  const toggleVRMode = () => {
    setVrMode(!vrMode)

    // When entering VR mode, go to fullscreen and hide controls
    if (!vrMode) {
      if (!isFullscreen) {
        toggleFullscreen()
      }
      setControlsPosition("hidden")
      setEnableOrbitControls(false)

      // Force landscape mode for VR if possible
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch((e) => console.error("Could not lock orientation", e))
      }
    } else {
      setControlsPosition(isMobile ? "bottom" : "side")
      setEnableOrbitControls(true)

      // Unlock orientation
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock()
      }
    }
  }

  // Add speech note
  const addSpeechNote = () => {
    if (notesInputRef.current && notesInputRef.current.value.trim()) {
      setSpeechNotes((prev) => [...prev, notesInputRef.current.value.trim()])
      notesInputRef.current.value = ""
    }
  }

  // Remove speech note
  const removeSpeechNote = (index) => {
    setSpeechNotes((prev) => prev.filter((_, i) => i !== index))
  }

  // Save session as a report
  const saveSessionReport = () => {
    if (!feedback) return

    const reportData = {
      topic: speechTopic || "Untitled Speech",
      date: new Date().toLocaleString(),
      duration: `${Math.floor(speechDuration / 60)}m ${speechDuration % 60}s`,
      audienceSize,
      audienceMood,
      notes: speechNotes,
      metrics: {
        pacing: feedback.pacing,
        clarity: feedback.clarity,
        confidence: feedback.confidence,
        eyeContact: feedback.eyeContact,
      },
      tips: feedback.tips,
    }

    // Convert to JSON and create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `speech_report_${new Date().toISOString().split("T")[0]}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  // Toggle controls position for mobile
  const toggleControlsPosition = () => {
    setControlsPosition((prev) => {
      if (prev === "hidden") return "bottom"
      if (prev === "bottom") return "hidden"
      return prev
    })
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle fullscreen change event with proper browser support
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
          !!document.webkitFullscreenElement ||
          !!document.mozFullScreenElement ||
          !!document.msFullscreenElement,
      )
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  // Adjust layout for mobile
  useEffect(() => {
    if (isMobile) {
      // On mobile, start with controls at bottom in landscape
      const handleOrientationChange = () => {
        const isLandscape = window.innerWidth > window.innerHeight
        setControlsPosition(isLandscape ? "bottom" : "side")
      }

      handleOrientationChange()
      window.addEventListener("resize", handleOrientationChange)

      return () => {
        window.removeEventListener("resize", handleOrientationChange)
      }
    }
  }, [isMobile])

  // Render the control panel based on position
  const renderControlPanel = () => {
    if (controlsPosition === "hidden") return null

    const isBottomControls = controlsPosition === "bottom"

    return (
      <div
        className={cn(
          "bg-gray-800 text-white overflow-y-auto relative",
          isBottomControls
            ? "w-full h-1/3 border-t border-gray-700"
            : isMobile
              ? "w-full h-1/2"
              : "w-full lg:w-1/4 h-full border-r border-gray-700",
        )}
      >
        {isBottomControls && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-800 border border-gray-700"
            onClick={toggleControlsPosition}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">VR Speech Trainer</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Fullscreen className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speech-topic">Speech Topic</Label>
                <Input
                  id="speech-topic"
                  value={speechTopic}
                  onChange={(e) => setSpeechTopic(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Enter your speech topic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speech-notes">Speech Notes</Label>
                <div className="flex space-x-2">
                  <Input
                    id="speech-notes"
                    ref={notesInputRef}
                    className="bg-gray-700 border-gray-600 flex-1"
                    placeholder="Add key points (optional)"
                  />
                  <Button onClick={addSpeechNote} variant="outline">
                    Add
                  </Button>
                </div>
                {speechNotes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {speechNotes.map((note, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm">
                        <span>• {note}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeSpeechNote(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Audience Size: {audienceSize} people</Label>
                  <span className="text-sm text-gray-400">
                    {audienceSize < 5 ? "Small" : audienceSize > 15 ? "Large" : "Medium"}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[audienceSize]}
                  onValueChange={(value) => setAudienceSize(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience-mood">Audience Mood</Label>
                <Select value={audienceMood} onValueChange={setAudienceMood}>
                  <SelectTrigger id="audience-mood" className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                {!recording ? (
                  <Button onClick={startSpeech} className="w-full bg-green-600 hover:bg-green-700">
                    <Mic className="mr-2 h-4 w-4" />
                    Start Speech
                  </Button>
                ) : (
                  <Button onClick={endSpeech} variant="destructive" className="w-full">
                    <MicOff className="mr-2 h-4 w-4" />
                    End Speech ({Math.floor(speechDuration / 60)}:{(speechDuration % 60).toString().padStart(2, "0")})
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="environment-preset">Environment Type</Label>
                <Select value={environmentPreset} onValueChange={setEnvironmentPreset}>
                  <SelectTrigger id="environment-preset" className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">Conference Room</SelectItem>
                    <SelectItem value="dawn">Auditorium</SelectItem>
                    <SelectItem value="sunset">Outdoor Event</SelectItem>
                    <SelectItem value="night">Evening Reception</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>View Position</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={viewMode === "audience" ? "default" : "outline"}
                    onClick={() => changeViewMode("audience")}
                    className="text-xs"
                  >
                    Audience View
                  </Button>
                  <Button
                    variant={viewMode === "speaker" ? "default" : "outline"}
                    onClick={() => changeViewMode("speaker")}
                    className="text-xs"
                  >
                    Speaker View
                  </Button>
                  <Button
                    variant={viewMode === "top" ? "default" : "outline"}
                    onClick={() => changeViewMode("top")}
                    className="text-xs"
                  >
                    Top View
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Speaker Appearance</Label>
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    variant={speakerColor === "#2a4a8a" ? "default" : "outline"}
                    className="w-full h-8 bg-blue-800 hover:bg-blue-700"
                    onClick={() => setSpeakerColor("#2a4a8a")}
                  />
                  <Button
                    variant={speakerColor === "#4a2a8a" ? "default" : "outline"}
                    className="w-full h-8 bg-purple-800 hover:bg-purple-700"
                    onClick={() => setSpeakerColor("#4a2a8a")}
                  />
                  <Button
                    variant={speakerColor === "#8a2a4a" ? "default" : "outline"}
                    className="w-full h-8 bg-red-800 hover:bg-red-700"
                    onClick={() => setSpeakerColor("#8a2a4a")}
                  />
                  <Button
                    variant={speakerColor === "#2a8a4a" ? "default" : "outline"}
                    className="w-full h-8 bg-green-800 hover:bg-green-700"
                    onClick={() => setSpeakerColor("#2a8a4a")}
                  />
                  <Button
                    variant={speakerColor === "#8a8a2a" ? "default" : "outline"}
                    className="w-full h-8 bg-yellow-800 hover:bg-yellow-700"
                    onClick={() => setSpeakerColor("#8a8a2a")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Controls</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={enableOrbitControls ? "default" : "outline"}
                    onClick={() => setEnableOrbitControls(!enableOrbitControls)}
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {enableOrbitControls ? "Free Camera" : "Fixed Camera"}
                  </Button>
                  <Button
                    variant={showStats ? "default" : "outline"}
                    onClick={() => setShowStats(!showStats)}
                    className="flex-1"
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    {showStats ? "Hide Stats" : "Show Stats"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vr-mode">VR Mode (Mobile Headsets)</Label>
                  <Switch id="vr-mode" checked={vrMode} onCheckedChange={toggleVRMode} />
                </div>
                {vrMode && (
                  <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-md text-sm">
                    <p className="flex items-center">
                      <Headphones className="h-4 w-4 mr-2" />
                      Place your phone in a VR headset for immersive view
                    </p>
                    <p className="mt-1 text-xs">Double-tap screen to reset view orientation</p>
                  </div>
                )}
              </div>

              {isMobile && (
                <div className="space-y-2">
                  <Label>Mobile Controls</Label>
                  <div className="p-3 bg-gray-700 rounded text-sm">
                    <p className="mb-2">
                      <Eye className="inline-block mr-1 h-4 w-4" />
                      Tilt your device to look around in VR mode
                    </p>
                    <p>Rotate to landscape for immersive view</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback">
              {feedback ? (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Speech Feedback</h3>
                      <Button variant="outline" size="sm" onClick={saveSessionReport}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Report
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Pacing</Label>
                          <span>{feedback.pacing}%</span>
                        </div>
                        <Progress value={feedback.pacing} className="h-2" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Clarity</Label>
                          <span>{feedback.clarity}%</span>
                        </div>
                        <Progress value={feedback.clarity} className="h-2" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Confidence</Label>
                          <span>{feedback.confidence}%</span>
                        </div>
                        <Progress value={feedback.confidence} className="h-2" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Eye Contact</Label>
                          <span>{feedback.eyeContact}%</span>
                        </div>
                        <Progress value={feedback.eyeContact} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Tips for Improvement:</h4>
                      <ul className="space-y-1 text-sm">
                        {feedback.tips.map((tip, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <Button onClick={startSpeech} className="w-full bg-green-600 hover:bg-green-700">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Practice Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
                  <Timer className="h-12 w-12 text-gray-400" />
                  <div>
                    <h3 className="text-xl font-bold">No Feedback Yet</h3>
                    <p className="text-gray-400">Complete a speech session to receive feedback</p>
                  </div>
                  <Button onClick={() => setActiveTab("controls")} variant="outline">
                    Go to Controls
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {recording && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
              <div className="flex-1">Recording in progress</div>
              <div className="font-mono">
                {Math.floor(speechDuration / 60)}:{(speechDuration % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-gray-900">
      {/* Control Panel - Conditionally shown based on position */}
      {controlsPosition === "side" && renderControlPanel()}

      {/* VR View */}
      <div
        className={cn(
          "relative",
          controlsPosition === "side" ? (isMobile ? "w-full h-1/2" : "w-full lg:w-3/4 h-full") : "w-full h-full",
        )}
        ref={canvasRef}
      >
        <div className="w-full h-full">
          <Canvas shadows>
            {/* Custom camera with perspective settings */}
            <PerspectiveCamera
              makeDefault
              position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
              fov={70}
              near={0.1}
              far={1000}
            />

            <CameraController position={cameraPosition} target={cameraTarget} enableRotation={enableOrbitControls} />

            {/* Enhanced orientation controls for mobile */}
            {isMobile && !enableOrbitControls && (
              <SmoothOrientationControls onOrientationChange={handleOrientationChange} vrMode={vrMode} />
            )}

            {/* Stereo effect for VR mode */}
            <StereoEffect active={vrMode}>
              {/* Environment based on preset */}
              <Environment preset={environmentPreset} background={false} />
              <color attach="background" args={[environmentPreset === "night" ? "#020209" : "#101020"]} />
              <fog attach="fog" args={[environmentPreset === "night" ? "#020209" : "#101020", 5, 30]} />

              {/* Main scene */}
              <VirtualRoom
                audienceSize={audienceSize}
                audienceMood={audienceMood}
                environmentPreset={environmentPreset}
                speechTopic={speechTopic}
                speechNotes={speechNotes}
                recording={recording}
              />

              {/* Speech timer */}
              <SpeechTimer duration={speechDuration} visible={recording} />
            </StereoEffect>

            {/* Orbit controls when enabled */}
            {enableOrbitControls && !vrMode && (
              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={1}
                maxDistance={15}
                target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
              />
            )}
          </Canvas>
        </div>

        {/* Mobile toggle for controls */}
        {controlsPosition === "hidden" && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 bg-black/50 border-gray-700 hover:bg-black/70 z-50"
            onClick={toggleControlsPosition}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* Camera controls overlay */}
        <div className="absolute top-4 right-4 flex space-x-2 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-black/50 border-gray-700 hover:bg-black/70"
          >
            <Fullscreen className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowStats(!showStats)}
            className="bg-black/50 border-gray-700 hover:bg-black/70"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>

        {/* VR mode toggle */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-50">
          <Button
            variant={vrMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVRMode}
            className="bg-black/50 border-gray-700 hover:bg-black/70"
          >
            {vrMode ? (
              <>
                <EyeOff className="mr-1 h-4 w-4" />
                Exit VR
              </>
            ) : (
              <>
                <Eye className="mr-1 h-4 w-4" />
                VR Mode
              </>
            )}
          </Button>
        </div>

        {/* Audience size indicator */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center z-50">
          <Users className="h-4 w-4 mr-1" />
          {audienceSize}
        </div>

        {/* Recording indicator */}
        {recording && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white p-2 rounded text-sm flex items-center z-50">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
            Recording: {Math.floor(speechDuration / 60)}:{(speechDuration % 60).toString().padStart(2, "0")}
          </div>
        )}

        {/* View mode buttons */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-50">
          {controlsPosition !== "hidden" && (
            <>
              <Button
                variant={viewMode === "audience" ? "default" : "outline"}
                size="sm"
                onClick={() => changeViewMode("audience")}
                className="bg-black/50 border-gray-700 hover:bg-black/70"
              >
                Audience
              </Button>
              <Button
                variant={viewMode === "speaker" ? "default" : "outline"}
                size="sm"
                onClick={() => changeViewMode("speaker")}
                className="bg-black/50 border-gray-700 hover:bg-black/70"
              >
                Speaker
              </Button>
              <Button
                variant={viewMode === "top" ? "default" : "outline"}
                size="sm"
                onClick={() => changeViewMode("top")}
                className="bg-black/50 border-gray-700 hover:bg-black/70"
              >
                Top
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom controls for mobile */}
      {controlsPosition === "bottom" && renderControlPanel()}
    </div>
  )
}

export default VRSpeechTrainer


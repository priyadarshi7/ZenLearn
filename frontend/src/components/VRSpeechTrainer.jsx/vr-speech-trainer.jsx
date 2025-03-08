import { useState, useRef, useEffect, useMemo, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  Environment,
  useGLTF,
  Text,
  Stats,
  Sky,
  OrbitControls,
  Html,
  useAnimations,
  Cloud,
  Stars,
  Sparkles,
  CameraShake,
  Float,
  Loader,
  useProgress,
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
import {
  Activity,
  Fullscreen,
  FullscreenIcon as FullscreenExit,
  Mic,
  MicOff,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Smartphone,
  Timer,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { useMediaQuery } from "../../hooks/use-mobile"

// Preload the model
useGLTF.preload('/models/person.glb');

// Loading progress component
const LoadingScreen = () => {
  const { progress } = useProgress()
  return (
    (<Html center>
      <div
        className="flex flex-col items-center justify-center bg-black/80 p-6 rounded-lg text-white">
        <div className="w-40 h-2 bg-gray-700 rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm">Loading VR Environment... {progress.toFixed(0)}%</p>
      </div>
    </Html>)
  );
}

// Audience Member component using the provided GLB model
const AudienceMember = ({ position, emotion = "neutral", lookAt }) => {
  const modelRef = useRef()
  const [animationIndex, setAnimationIndex] = useState(0)

  // Load the provided GLB model with error handling
  const { scene, animations } = useGLTF("/models/person.glb", undefined, (error) => {
    console.error("Error loading model:", error)
  })

  // Clone the model to prevent sharing issues
  const model = useMemo(() => {
    if (scene) {
      try {
        return scene.clone(true);
      } catch (e) {
        console.error("Error cloning model:", e)
        return createPlaceholderPerson(emotion);
      }
    }
    return createPlaceholderPerson(emotion);
  }, [scene, emotion])

  // Set up animations if available
  const { actions, mixer } = useAnimations(animations, modelRef)

  useEffect(() => {
    // Set random animation timing
    setAnimationIndex(Math.floor(Math.random() * 3))

    // Play a random animation if available
    if (actions && Object.keys(actions).length > 0) {
      const animationNames = Object.keys(actions)
      const randomAnim = animationNames[Math.floor(Math.random() * animationNames.length)]
      actions[randomAnim]?.play()
    }

    // Apply emotion color to the model
    if (model) {
      model.traverse((node) => {
        if (node.isMesh && (node.name.includes("Head") || node.name.includes("Face"))) {
          const material = node.material.clone()

          // Apply subtle color tint based on emotion
          switch (emotion) {
            case "interested":
              material.emissive = new THREE.Color("#0066ff")
              material.emissiveIntensity = 0.2
              break
            case "bored":
              material.emissive = new THREE.Color("#ff6600")
              material.emissiveIntensity = 0.1
              break
            case "challenging":
              material.emissive = new THREE.Color("#ff0000")
              material.emissiveIntensity = 0.2
              break
            case "friendly":
              material.emissive = new THREE.Color("#00ff00")
              material.emissiveIntensity = 0.2
              break
            default:
              material.emissive = new THREE.Color("#ffffff")
              material.emissiveIntensity = 0.1
          }

          node.material = material
        }
      })
    }

    return () => {
      // Clean up animations
      if (mixer) {
        mixer.stopAllAction()
      }
    };
  }, [model, actions, mixer, emotion])

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
        modelRef.current.rotation.x = Math.sin(time * 0.5 + offset) * 0.05
      } else if (emotion === "bored") {
        // Slight swaying
        modelRef.current.rotation.z = Math.sin(time * 0.2 + offset) * 0.03
      } else if (emotion === "challenging") {
        // Head shaking
        modelRef.current.rotation.y = Math.sin(time * 0.7 + offset) * 0.1 + modelRef.current.userData.baseRotationY
      }
    }
  })

  // Add some randomness to make audience look more natural
  const randomScale = useMemo(() => 0.5 + (Math.random() * 0.1 - 0.05), [])
  const randomRotation = useMemo(() => Math.random() * 0.2 - 0.1, [])

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.userData.baseRotationY = randomRotation
    }
  }, [randomRotation])

  return (
    (<primitive
      ref={modelRef}
      object={model}
      position={position}
      rotation={[0, randomRotation, 0]}
      scale={[randomScale, randomScale, randomScale]}
      castShadow />)
  );
}

// Create a placeholder person model as fallback
const createPlaceholderPerson = (emotion = "neutral") => {
  const group = new THREE.Group()

  // Body
  const bodyColor = ["#3a3a3a", "#2a2a2a", "#4a4a4a", "#5a5a5a"][Math.floor(Math.random() * 4)]
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.2, 0.6, 4, 8),
    new THREE.MeshStandardMaterial({ color: bodyColor })
  )
  body.position.set(0, 0.6, 0)
  group.add(body)

  // Head
  const headColor =
    emotion === "friendly"
      ? "#88ff88"
      : emotion === "interested"
        ? "#88ccff"
        : emotion === "challenging"
          ? "#ff8888"
          : emotion === "bored"
            ? "#ffaa88"
            : "#cccccc"

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({ color: headColor })
  )
  head.position.set(0, 1.1, 0)
  group.add(head)

  // Arms
  const leftArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.07, 0.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: bodyColor })
  )
  leftArm.position.set(-0.3, 0.6, 0)
  leftArm.rotation.z = Math.PI / 6
  group.add(leftArm)

  const rightArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.07, 0.5, 4, 8),
    new THREE.MeshStandardMaterial({ color: bodyColor })
  )
  rightArm.position.set(0.3, 0.6, 0)
  rightArm.rotation.z = -Math.PI / 6
  group.add(rightArm)

  return group
}

// Chair component for audience seating
const Chair = ({ position }) => {
  return (
    (<group position={position}>
      {/* Chair seat */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#331a00" roughness={0.9} />
      </mesh>
      {/* Chair back */}
      <mesh castShadow receiveShadow position={[0, 0.65, -0.25]}>
        <boxGeometry args={[0.6, 0.7, 0.1]} />
        <meshStandardMaterial color="#331a00" roughness={0.9} />
      </mesh>
      {/* Chair legs */}
      <mesh castShadow position={[-0.25, 0.05, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.25, 0.05, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.25, 0.05, -0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.25, 0.05, -0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#222222" metalness={0.5} />
      </mesh>
    </group>)
  );
}

// Speaker podium with microphone
const Podium = () => {
  return (
    (<group position={[0, -0.25, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.8, 0.8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {/* Decorative trim on podium */}
      <mesh position={[0, 0.41, 0]} castShadow>
        <boxGeometry args={[1.5, 0.02, 0.9]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Microphone */}
      <group position={[0, 0.41, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
          <meshStandardMaterial color="#111111" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#222222" metalness={0.9} />
        </mesh>
      </group>
    </group>)
  );
}

// Speaker avatar (visible representation of the user)
const SpeakerAvatar = ({ recording }) => {
  const ref = useRef()

  // Animate the speaker when recording
  useFrame(({ clock }) => {
    if (ref.current && recording) {
      const t = clock.getElapsedTime()
      // Subtle speaking animation
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.1
      ref.current.position.y = Math.sin(t * 2) * 0.02 + 0.7
    }
  })

  return (
    (<group position={[0, 0.7, 0]} ref={ref}>
      {/* Speaker body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.25, 0.7, 8, 16]} />
        <meshStandardMaterial color="#2a4a8a" />
      </mesh>
      {/* Speaker head */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#e0c080" />
      </mesh>
      {/* Arms */}
      <group position={[0, 0.2, 0]}>
        {/* Left arm */}
        <mesh position={[-0.35, 0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
          <meshStandardMaterial color="#2a4a8a" />
        </mesh>

        {/* Right arm */}
        <mesh position={[0.35, 0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
          <meshStandardMaterial color="#2a4a8a" />
        </mesh>
      </group>
      {/* Recording indicator */}
      {recording && <pointLight position={[0, 0.6, 0.3]} distance={0.5} intensity={2} color="red" />}
    </group>)
  );
}

// Presentation screen component
const PresentationScreen = ({ topic }) => {
  return (
    (<group position={[0, 2.5, -9.8]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[12, 6, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[11.5, 5.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
      </mesh>
      {/* Display the speech topic on the screen */}
      {topic && (
        <Text
          position={[0, 0, 0.07]}
          fontSize={0.5}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={10}>
          {topic}
        </Text>
      )}
    </group>)
  );
}

// Speech timer display in 3D space
const SpeechTimer = ({ duration, position = [0, 2, -3], visible }) => {
  if (!visible) return null

  // Format time as MM:SS
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    (<Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        position={position}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#00000080"
        padding={0.2}>
        {timeString}
      </Text>
    </Float>)
  );
}

// Virtual Room setup with improved audience distribution
const VirtualRoom = ({ audienceSize, audienceMood, environmentPreset, speechTopic, recording }) => {
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
      });
  }, [audienceSize, audienceMood])

  // Determine floor and wall textures based on environment
  const getTextureUrl = () => {
    switch (environmentPreset) {
      case "city":
        return "https://images.unsplash.com/photo-1541451378359-acdede43fdf4?w=800&auto=format&fit=crop"
      case "sunset":
        return "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800&auto=format&fit=crop"
      case "night":
        return "https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=800&auto=format&fit=crop"
      case "dawn":
      default:
        return "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop"
    }
  }

  // Load textures with error handling
  const textureUrl = getTextureUrl()
  const [floorTexture, setFloorTexture] = useState(null)
  const [wallTexture, setWallTexture] = useState(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()

    // Load floor texture
    loader.load(textureUrl, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(10, 10)
      setFloorTexture(texture)
    }, undefined, (error) => {
      console.error("Error loading floor texture:", error)
      // Create a fallback texture
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 128
      const context = canvas.getContext("2d")
      context.fillStyle = "#ddc9a3"
      context.fillRect(0, 0, 128, 128)
      const fallbackTexture = new THREE.CanvasTexture(canvas)
      fallbackTexture.wrapS = fallbackTexture.wrapT = THREE.RepeatWrapping
      fallbackTexture.repeat.set(10, 10)
      setFloorTexture(fallbackTexture)
    })

    // Load wall texture
    loader.load(textureUrl, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(5, 2)
      setWallTexture(texture)
    }, undefined, (error) => {
      console.error("Error loading wall texture:", error)
      // Create a fallback texture
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 128
      const context = canvas.getContext("2d")
      context.fillStyle = "#f5f5f5"
      context.fillRect(0, 0, 128, 128)
      const fallbackTexture = new THREE.CanvasTexture(canvas)
      fallbackTexture.wrapS = fallbackTexture.wrapT = THREE.RepeatWrapping
      fallbackTexture.repeat.set(5, 2)
      setWallTexture(fallbackTexture)
    })

    return () => {
      if (floorTexture) floorTexture.dispose()
      if (wallTexture) wallTexture.dispose()
    };
  }, [textureUrl])

  // Get floor and wall colors based on environment
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

  return (<>
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
      shadow-camera-bottom={-10} />
    <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
    {/* Enhanced room environment */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial map={floorTexture} color={colors.floor} roughness={0.8} metalness={0.2} />
    </mesh>
    {/* Improved walls with textures */}
    <mesh position={[0, 4, -10]} rotation={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 10]} />
      <meshStandardMaterial map={wallTexture} color={colors.wall} roughness={0.7} />
    </mesh>
    <mesh position={[-15, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[20, 10]} />
      <meshStandardMaterial map={wallTexture} color={colors.wall} roughness={0.7} />
    </mesh>
    <mesh position={[15, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[20, 10]} />
      <meshStandardMaterial map={wallTexture} color={colors.wall} roughness={0.7} />
    </mesh>
    {/* Enhanced podium */}
    <Podium />
    {/* Speaker avatar (you) */}
    <SpeakerAvatar recording={recording} />
    {/* Presentation screen */}
    <PresentationScreen topic={speechTopic} />
    {/* Side lights for ambiance */}
    <pointLight position={[-8, 4, -5]} intensity={0.3} color="#ffaa77" />
    <pointLight position={[8, 4, -5]} intensity={0.3} color="#ffaa77" />
    {/* Enhanced audience chairs */}
    {positions.map((pos, index) => (
      <Chair key={`chair-${index}`} position={[pos[0], -0.3, pos[2]]} />
    ))}
    {/* Audience */}
    <Suspense fallback={null}>
      {positions.map((pos, index) => (
        <AudienceMember
          key={`person-${index}`}
          position={[pos[0], 0.2, pos[2]]}
          emotion={emotions[index]}
          lookAt={new THREE.Vector3(0, 1, 0)} />
      ))}
    </Suspense>
    {/* Environment-specific decorations */}
    {environmentPreset === "night" && (
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1} />
    )}
    {environmentPreset === "sunset" && <Cloud position={[-10, 10, -15]} speed={0.2} opacity={0.5} />}
    {environmentPreset === "dawn" && <Sparkles count={50} scale={20} size={2} speed={0.3} opacity={0.5} />}
    {/* Add subtle camera shake when recording to simulate real speech */}
    {recording && (
      <CameraShake
        maxYaw={0.01}
        maxPitch={0.01}
        maxRoll={0.01}
        yawFrequency={0.5}
        pitchFrequency={0.4}
        rollFrequency={0.3} />
    )}
  </>);
}

// Environment renderer based on preset
const EnvironmentRenderer = ({ preset }) => {
  switch (preset) {
    case "city": // Conference Room
      return (<>
        <color attach="background" args={["#101020"]} />
        <fog attach="fog" args={["#101020", 5, 30]} />
        <Environment preset="city" background={false} />
      </>);
    case "dawn": // Auditorium
      return (<>
        <color attach="background" args={["#202040"]} />
        <fog attach="fog" args={["#202040", 5, 30]} />
        <Environment preset="dawn" background={false} />
        <directionalLight position={[5, 8, 5]} intensity={0.3} castShadow />
      </>);
    case "sunset": // Outdoor Event
      return (<>
        <color attach="background" args={["#381c1c"]} />
        <fog attach="fog" args={["#381c1c", 8, 30]} />
        <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={0.5} />
        <Environment preset="sunset" background={false} />
        <directionalLight position={[10, 5, 5]} intensity={1} color="#ff9966" castShadow />
      </>);
    case "night": // Evening Reception
      return (<>
        <color attach="background" args={["#020209"]} />
        <fog attach="fog" args={["#020209", 5, 25]} />
        <Environment preset="night" background={false} />
        <pointLight position={[0, 5, 0]} intensity={0.6} color="#7777ff" />
        <pointLight position={[-5, 2, -5]} intensity={0.4} color="#ff77ff" />
        <pointLight position={[5, 2, -5]} intensity={0.4} color="#77ffff" />
      </>);
    default:
      return <Environment preset="dawn" background={false} />;
  }
}

// Camera controller component
const CameraController = ({ position, target, enableRotation }) => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(position.x, position.y, position.z)
    camera.lookAt(target.x, target.y, target.z)
  }, [camera, position, target])

  return null
}

// Mobile orientation detector
const MobileOrientationController = ({ onOrientationChange }) => {
  useEffect(() => {
    const handleOrientation = (event) => {
      // Get device orientation data
      const beta = event.beta // X-axis rotation (-180 to 180)
      const gamma = event.gamma // Y-axis rotation (-90 to 90)

      // Only use reasonable values
      if (beta !== null && gamma !== null) {
        // Convert orientation to camera position
        // Limit the range to avoid extreme movements
        const betaLimited = Math.max(-45, Math.min(45, beta)) / 45
        const gammaLimited = Math.max(-45, Math.min(45, gamma)) / 45

        // Calculate new camera position based on device orientation
        onOrientationChange({
          x: gammaLimited * 5, // Left-right movement
          y: 1.5 - betaLimited * 0.5, // Up-down movement
          z: 5 - Math.abs(betaLimited) * 2, // Forward-backward movement
        })
      }
    }

    // Add event listener for device orientation
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation)
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
    };
  }, [onOrientationChange])

  return null
}

// Main component
const VRSpeechTrainer = () => {
  const [recording, setRecording] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [audienceSize, setAudienceSize] = useState(10)
  const [audienceMood, setAudienceMood] = useState("neutral")
  const [speechTopic, setSpeechTopic] = useState("")
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
  const intervalRef = useRef(null)
  const canvasRef = useRef()
  const audioRef = useRef(null)

  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Handle mobile orientation changes
  const handleOrientationChange = (newPosition) => {
    if (isMobile && !enableOrbitControls) {
      setCameraPosition((prev) => ({
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      }))
    }
  }

  // Play ambient sound
  useEffect(() => {
    // Create audio element for ambient sound
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
    };
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
  }

  // End speech, clear timer, and generate feedback
  const endSpeech = () => {
    setRecording(false)

    // Clear timer interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
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
        confidence: Math.min(100, Math.max(50, confidenceBase + moodFactor + audienceFactor)),
        eyeContact: Math.min(100, Math.max(50, 70 + (audienceSize > 10 ? -10 : 0))),
        tips: [
          audienceSize > 10
            ? "Try to scan the entire audience - you missed engaging with people on the sides"
            : "Good job making eye contact across the audience",
          speechDuration < 60
            ? "Your speech was quite brief - consider developing your points more fully"
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

  // Update camera position based on view mode
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

  // Change view mode
  const changeViewMode = (mode) => {
    setViewMode(mode)
    updateCameraForViewMode(mode)
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

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    };
  }, [])

  // Handle fullscreen change event with proper browser support
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.mozFullScreenElement ||
        !!document.msFullscreenElement)
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
    };
  }, [])

  // Handle device orientation for mobile
  useEffect(() => {
    // Request permission for device orientation on iOS 13+
    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission()
          if (permission !== "granted") {
            console.log("Device orientation permission not granted")
          }
        } catch (error) {
          console.error("Error requesting device orientation permission:", error)
        }
      }
    }

    // Request permission when user interacts with the app
    const handleUserInteraction = () => {
      requestPermission()
      document.removeEventListener("click", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
    };
  }, [])

  // Adjust layout for mobile
  useEffect(() => {
    if (isMobile) {
      // On mobile, start with controls hidden in landscape
      const handleOrientationChange = () => {
        const isLandscape = window.innerWidth > window.innerHeight
        setShowControls(!isLandscape)
      }

      handleOrientationChange()
      window.addEventListener("resize", handleOrientationChange)

      return () => {
        window.removeEventListener("resize", handleOrientationChange)
      };
    }
  }, [isMobile])

  return (
    (<div className="flex flex-col lg:flex-row w-full h-screen bg-gray-900">
      {/* Control Panel - Conditionally shown on mobile */}
      {(showControls || !isMobile) && (
        <div
          className={`${isMobile ? "w-full h-1/2" : "w-full lg:w-1/4"} p-4 bg-gray-800 text-white overflow-y-auto relative`}>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setShowControls(false)}>
              <X className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">VR Speech Trainer</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExit className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
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
                  placeholder="Enter your speech topic" />
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
                  onValueChange={(value) => setAudienceSize(value[0])} />
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
                    className="text-xs">
                    Audience View
                  </Button>
                  <Button
                    variant={viewMode === "speaker" ? "default" : "outline"}
                    onClick={() => changeViewMode("speaker")}
                    className="text-xs">
                    Speaker View
                  </Button>
                  <Button
                    variant={viewMode === "top" ? "default" : "outline"}
                    onClick={() => changeViewMode("top")}
                    className="text-xs">
                    Top View
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Controls</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={enableOrbitControls ? "default" : "outline"}
                    onClick={() => setEnableOrbitControls(!enableOrbitControls)}
                    className="flex-1">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {enableOrbitControls ? "Free Camera" : "Fixed Camera"}
                  </Button>
                  <Button
                    variant={showStats ? "default" : "outline"}
                    onClick={() => setShowStats(!showStats)}
                    className="flex-1">
                    <Activity className="mr-2 h-4 w-4" />
                    {showStats ? "Hide Stats" : "Show Stats"}
                  </Button>
                </div>
              </div>

              {isMobile && (
                <div className="space-y-2">
                  <Label>Mobile Controls</Label>
                  <div className="p-3 bg-gray-700 rounded text-sm">
                    <p className="mb-2">
                      <Smartphone className="inline-block mr-1 h-4 w-4" />
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
                        <Progress value={feedback.pacing} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Clarity</Label>
                          <span>{feedback.clarity}%</span>
                        </div>
                        <Progress value={feedback.clarity} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Confidence</Label>
                          <span>{feedback.confidence}%</span>
                        </div>
                        <Progress value={feedback.confidence} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label>Eye Contact</Label>
                          <span>{feedback.eyeContact}%</span>
                        </div>
                        <Progress value={feedback.eyeContact} />
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
                <div
                  className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
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
            <div
              className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
              <div className="flex-1">Recording in progress</div>
              <div className="font-mono">
                {Math.floor(speechDuration / 60)}:{(speechDuration % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      )}
      {/* VR View */}
      <div
        className={`${isMobile && !showControls ? "w-full h-full" : isMobile ? "w-full h-1/2" : "w-full lg:w-3/4 h-full"} relative`}
        ref={canvasRef}>
        <Canvas shadows>
          {showStats && <Stats />}

          <CameraController
            position={cameraPosition}
            target={cameraTarget}
            enableRotation={enableOrbitControls} />

          {/* Mobile orientation controller */}
          {isMobile && !enableOrbitControls && (
            <MobileOrientationController onOrientationChange={handleOrientationChange} />
          )}

          <EnvironmentRenderer preset={environmentPreset} />

          <Suspense fallback={<LoadingScreen />}>
            <VirtualRoom
              audienceSize={audienceSize}
              audienceMood={audienceMood}
              environmentPreset={environmentPreset}
              speechTopic={speechTopic}
              recording={recording} />
            <SpeechTimer duration={speechDuration} visible={recording} />
          </Suspense>

          {enableOrbitControls && (
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={1}
              maxDistance={15}
              target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]} />
          )}
        </Canvas>

        {/* Mobile toggle for controls */}
        {isMobile && !showControls && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 bg-black/50 border-gray-700 hover:bg-black/70"
            onClick={() => setShowControls(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* Camera controls overlay */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-black/50 border-gray-700 hover:bg-black/70">
            {isFullscreen ? <FullscreenExit className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowStats(!showStats)}
            className="bg-black/50 border-gray-700 hover:bg-black/70">
            <Activity className="h-4 w-4" />
          </Button>
        </div>

        {/* Audience size indicator */}
        <div
          className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {audienceSize}
        </div>

        {/* Recording indicator */}
        {recording && (
          <div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white p-2 rounded text-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
            Recording: {Math.floor(speechDuration / 60)}:{(speechDuration % 60).toString().padStart(2, "0")}
          </div>
        )}

        {/* View mode buttons */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
          <Button
            variant={viewMode === "audience" ? "default" : "outline"}
            size="sm"
            onClick={() => changeViewMode("audience")}
            className="bg-black/50 border-gray-700 hover:bg-black/70">
            Audience View
          </Button>
          <Button
            variant={viewMode === "speaker" ? "default" : "outline"}
            size="sm"
            onClick={() => changeViewMode("speaker")}
            className="bg-black/50 border-gray-700 hover:bg-black/70">
            Speaker View
          </Button>
        </div>

        {/* Loader component */}
        <Loader />
      </div>
    </div>)
  );
}

export default VRSpeechTrainer


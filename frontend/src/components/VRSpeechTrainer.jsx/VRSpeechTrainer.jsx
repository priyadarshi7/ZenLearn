import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Environment, useGLTF, Text, Stats, Sky, OrbitControls } from '@react-three/drei';import * as THREE from 'three';

// Preload the model to prevent loading issues - make sure this path is correct
useGLTF.preload('/models/person.glb');

// Virtual Audience Member component with improved error handling
// Replace your current AudienceMember component with this improved version
// This handles missing models and randomizes people's appearances

const AudienceMember = ({ position, emotion = 'neutral', lookAt }) => {
  // This function creates a simple human figure if the model doesn't load
  const createPlaceholderPerson = () => {
    const group = new THREE.Group();
    
    // Body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.2, 0.6, 4, 8),
      new THREE.MeshStandardMaterial({ 
        color: ['#3a3a3a', '#2a2a2a', '#4a4a4a', '#5a5a5a'][Math.floor(Math.random() * 4)]
      })
    );
    body.position.set(0, 0.6, 0);
    group.add(body);
    
    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ 
        color: emotion === 'friendly' ? '#88ff88' :
               emotion === 'interested' ? '#88ccff' :
               emotion === 'challenging' ? '#ff8888' :
               emotion === 'bored' ? '#ffaa88' : '#cccccc'
      })
    );
    head.position.set(0, 1.1, 0);
    group.add(head);
    
    // Arms
    const leftArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.07, 0.5, 4, 8),
      new THREE.MeshStandardMaterial({ color: body.material.color })
    );
    leftArm.position.set(-0.3, 0.6, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.07, 0.5, 4, 8),
      new THREE.MeshStandardMaterial({ color: body.material.color })
    );
    rightArm.position.set(0.3, 0.6, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);
    
    return group;
  };
  
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Try to load the real model, but use placeholder as fallback
  const { scene } = useGLTF('/models/person.glb', undefined, () => {
    console.error("Failed to load person model, using placeholder");
  });
  
  // Create a clone of the model or use placeholder
  const model = useMemo(() => {
    if (scene) {
      try {
        const clone = scene.clone(true);
        setModelLoaded(true);
        return clone;
      } catch (e) {
        console.error("Error cloning model:", e);
        return createPlaceholderPerson();
      }
    }
    return createPlaceholderPerson();
  }, [scene]);
  
  // Apply emotion color to the model
  useEffect(() => {
    if (modelLoaded && model) {
      model.traverse((node) => {
        if (node.isMesh && node.name.includes('Head')) {
          const material = node.material.clone();
          
          switch(emotion) {
            case 'interested':
              material.color = new THREE.Color('#88ccff');
              break;
            case 'bored':
              material.color = new THREE.Color('#ffaa88');
              break;
            case 'challenging':
              material.color = new THREE.Color('#ff8888');
              break;
            case 'friendly':
              material.color = new THREE.Color('#88ff88');
              break;
            default:
              material.color = new THREE.Color('#cccccc');
          }
          
          node.material = material;
        }
      });
    }
  }, [emotion, model, modelLoaded]);
  
  // Make audience members look at speaker
  useFrame(() => {
    if (modelRef.current && lookAt) {
      const direction = new THREE.Vector3();
      direction.subVectors(lookAt, modelRef.current.position);
      modelRef.current.lookAt(lookAt);
    }
  });
  
  // Add some randomness to make audience look more natural
  const randomScale = useMemo(() => {
    return 0.5 + (Math.random() * 0.1 - 0.05);
  }, []);
  
  const randomRotation = useMemo(() => {
    return (Math.random() * 0.2 - 0.1);
  }, []);
  
  return (
    <primitive 
      ref={modelRef}
      object={model} 
      position={position} 
      rotation={[0, randomRotation, 0]}
      scale={[randomScale, randomScale, randomScale]}
      castShadow
    />
  );
};

// Fallback component for loading state
const LoadingFallback = () => {
  return (
    <Text
      position={[0, 1, 0]}
      color="white"
      fontSize={0.5}
      anchorX="center"
      anchorY="middle"
    >
      Loading virtual environment...
    </Text>
  );
};

// Virtual Room setup with improved audience distribution
const VirtualRoom = ({ audienceSize, audienceMood, speakerPosition = [0, 0, 0] }) => {
  // Load textures for better visual quality
  const floorTextures = useTexture({
    map: '/textures/image.png',
    normalMap: '/textures/image.png',
    roughnessMap: '/textures/image.png',
  });
  
  const wallTextures = useTexture({
    map: '/textures/image.png',
    normalMap: '/textures/image.png',
    roughnessMap: '/textures/image.png',
  });
  
  // Calculate audience positions - maintain your existing positions calculation
  const positions = useMemo(() => {
    const pos = [];
    
    // Calculate how many rows we need (max 5 people per row)
    const peoplePerRow = Math.min(10, audienceSize);
    const rows = Math.ceil(audienceSize / peoplePerRow);
    
    let count = 0;
    
    // Create multiple semi-circular rows
    for (let row = 0; row < rows; row++) {
      const rowPeople = Math.min(peoplePerRow, audienceSize - count);
      const rowDistance = 3 + row * 1.5; // Each row is further back
      
      for (let i = 0; i < rowPeople; i++) {
        // Calculate angle in the semi-circle
        const angle = (Math.PI * i) / (rowPeople - 1 || 1);
        const spreadFactor = 4 + row * 0.5; // Wider spread for back rows
        const x = Math.sin(angle) * spreadFactor;
        const z = -Math.cos(angle) * rowDistance - 1;
        pos.push([x, 0, z]);
        count++;
      }
    }
    
    return pos;
  }, [audienceSize]);

  // Distribute different emotions among audience members
  const emotions = useMemo(() => {
    return Array(audienceSize).fill().map((_, i) => {
      if (audienceMood === 'friendly') {
        return ['friendly', 'interested', 'neutral'][i % 3];
      } else if (audienceMood === 'challenging') {
        return ['challenging', 'bored', 'neutral'][i % 3];
      } else {
        return ['neutral', 'interested', 'bored'][i % 3];
      }
    });
  }, [audienceSize, audienceMood]);

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          {...floorTextures}
          color="#ddc9a3" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Improved walls with textures */}
      <mesh position={[0, 4, -10]} rotation={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial 
          {...wallTextures}
          color="#f5f5f5" 
          roughness={0.7}
        />
      </mesh>
      
      <mesh position={[-15, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial 
          {...wallTextures}
          color="#f0f0f0" 
          roughness={0.7}
        />
      </mesh>
      
      <mesh position={[15, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial 
          {...wallTextures}
          color="#f0f0f0" 
          roughness={0.7}
        />
      </mesh>
      
      {/* Enhanced podium */}
      <group position={[0, -0.25, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.8, 0.8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        {/* Decorative trim on podium */}
        <mesh position={[0, 0.41, 0]} castShadow>
          <boxGeometry args={[1.5, 0.02, 0.9]} />
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Presentation screen - more prominent and realistic */}
      <group position={[0, 2.5, -9.8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 6, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[11.5, 5.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
      </group>
      
      {/* Side lights for ambiance */}
      <pointLight position={[-8, 4, -5]} intensity={0.3} color="#ffaa77" />
      <pointLight position={[8, 4, -5]} intensity={0.3} color="#ffaa77" />
      
      {/* Decorative sconces on walls */}
      <group position={[-9, 2, -9.5]}>
        <mesh>
          <boxGeometry args={[0.5, 1.2, 0.2]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <pointLight position={[0, 0, 0.3]} intensity={0.3} color="#ffcc88" distance={5} />
      </group>
      
      <group position={[9, 2, -9.5]}>
        <mesh>
          <boxGeometry args={[0.5, 1.2, 0.2]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <pointLight position={[0, 0, 0.3]} intensity={0.3} color="#ffcc88" distance={5} />
      </group>
      
      {/* Enhanced audience chairs - more detailed and realistic */}
      {positions.map((pos, index) => (
        <group key={`chair-${index}`} position={[pos[0], -0.3, pos[2]]}>
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
        </group>
      ))}
      
      {/* Audience - replace this with the existing code that renders AudienceMembers */}
      <Suspense fallback={null}>
        {positions.map((pos, index) => (
          <AudienceMember 
            key={`person-${index}`} 
            position={[pos[0], 0.2, pos[2]]} 
            emotion={emotions[index]}
            lookAt={new THREE.Vector3(0, 1, 0)}
          />
        ))}
      </Suspense>
      
      {/* Add decorative plants */}
      <group position={[-10, 0, -8]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.6, 16]} />
          <meshStandardMaterial color="#a85432" />
        </mesh>
        <mesh castShadow position={[0, 1, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#005500" />
        </mesh>
      </group>
      
      <group position={[10, 0, -8]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.6, 16]} />
          <meshStandardMaterial color="#a85432" />
        </mesh>
        <mesh castShadow position={[0, 1, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#005500" />
        </mesh>
      </group>
    </>
  );
};

// Speech timer display in 3D space
const SpeechTimer = ({ duration, position = [0, 2, -3], visible }) => {
  if (!visible) return null;
  
  // Format time as MM:SS
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <Text
      position={position}
      fontSize={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
      backgroundColor="#00000080"
      padding={0.2}
    >
      {timeString}
    </Text>
  );
};

// Main component with enhanced functionality and fixed timer logic
const VRSpeechTrainer = () => {
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [audienceSize, setAudienceSize] = useState(5);
  const [audienceMood, setAudienceMood] = useState('neutral');
  const [speechTopic, setSpeechTopic] = useState('');
  const [speechDuration, setSpeechDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [environmentPreset, setEnvironmentPreset] = useState('dawn');
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 1.5, z: 5 });
  const intervalRef = useRef(null);
  const canvasRef = useRef();
  
  // Start recording speech with proper interval cleanup
  const startSpeech = () => {
    setRecording(true);
    setSpeechDuration(0);
    setFeedback(null);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start timer with ref to safely clear later
    intervalRef.current = setInterval(() => {
      setSpeechDuration(prev => prev + 1);
    }, 1000);
  };
  
  // End speech, clear timer, and generate feedback
  const endSpeech = () => {
    setRecording(false);
    
    // Clear timer interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Generate more detailed AI feedback based on current settings
    setTimeout(() => {
      // Simulated AI feedback with randomized values for demo
      const confidenceBase = Math.floor(Math.random() * 20) + 65; // 65-85 base
      const clarityBase = Math.floor(Math.random() * 20) + 70; // 70-90 base
      
      // Adjust metrics based on audience size and mood
      const audienceFactor = audienceSize > 10 ? -5 : audienceSize < 5 ? 5 : 0;
      const moodFactor = audienceMood === 'friendly' ? 5 : audienceMood === 'challenging' ? -5 : 0;
      
      setFeedback({
        pacing: Math.min(100, Math.max(50, 75 + moodFactor)),
        clarity: Math.min(100, Math.max(50, clarityBase + audienceFactor)),
        confidence: Math.min(100, Math.max(50, confidenceBase + moodFactor + audienceFactor)),
        eyeContact: Math.min(100, Math.max(50, 70 + (audienceSize > 10 ? -10 : 0))),
        tips: [
          audienceSize > 10 ? "Try to scan the entire audience - you missed engaging with people on the sides" : "Good job making eye contact across the audience",
          speechDuration < 60 ? "Your speech was quite brief - consider developing your points more fully" : "Your pacing was appropriate for the content",
          audienceMood === 'challenging' ? "You handled challenging audience reactions well" : "Try to vary your tone more when emphasizing key points",
          Math.random() > 0.5 ? "Consider using more hand gestures to emphasize points" : "Your body language effectively reinforced your message",
          speechTopic.length > 10 ? `Your explanation of "${speechTopic}" was clear and structured` : "Consider preparing a more specific speech topic for better focus"
        ].filter(Boolean)
      });
    }, 1500);
  };
  
  // Toggle fullscreen mode with proper error handling
  const toggleFullscreen = () => {
    try {
      if (!isFullscreen && canvasRef.current) {
        if (canvasRef.current.requestFullscreen) {
          canvasRef.current.requestFullscreen();
        } else if (canvasRef.current.webkitRequestFullscreen) {
          canvasRef.current.webkitRequestFullscreen();
        } else if (canvasRef.current.mozRequestFullScreen) {
          canvasRef.current.mozRequestFullScreen();
        } else if (canvasRef.current.msRequestFullscreen) {
          canvasRef.current.msRequestFullscreen();
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Handle fullscreen change event with proper browser support
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        !!document.webkitFullscreenElement || 
        !!document.mozFullScreenElement ||
        !!document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Reset camera position function
  const resetCamera = () => {
    setCameraPosition({ x: 0, y: 1.5, z: 5 });
  };
  
  // Save session as a report
  const saveSessionReport = () => {
    if (!feedback) return;
    
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
        eyeContact: feedback.eyeContact
      },
      tips: feedback.tips
    };
    
    // Convert to JSON and create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `speech_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  // const [environmentPreset, setEnvironmentPreset] = useState('dawn');

// Add these functions to render different environment styles
const renderEnvironment = () => {
  switch(environmentPreset) {
    case 'city': // Conference Room
      return (
        <>
          <color attach="background" args={['#101020']} />
          <fog attach="fog" args={['#101020', 5, 30]} />
          <Environment preset="city" background={false} />
        </>
      );
    case 'dawn': // Auditorium
      return (
        <>
          <color attach="background" args={['#202040']} />
          <fog attach="fog" args={['#202040', 5, 30]} />
          <Environment preset="dawn" background={false} />
          <directionalLight position={[5, 8, 5]} intensity={0.3} castShadow />
        </>
      );
    case 'sunset': // Outdoor Event
      return (
        <>
          <color attach="background" args={['#381c1c']} />
          <fog attach="fog" args={['#381c1c', 8, 30]} />
          <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={0.5} />
          <Environment preset="sunset" background={false} />
          <directionalLight position={[10, 5, 5]} intensity={1} color="#ff9966" castShadow />
        </>
      );
    case 'night': // Evening Reception
      return (
        <>
          <color attach="background" args={['#020209']} />
          <fog attach="fog" args={['#020209', 5, 25]} />
          <Environment preset="night" background={false} />
          <pointLight position={[0, 5, 0]} intensity={0.6} color="#7777ff" />
          <pointLight position={[-5, 2, -5]} intensity={0.4} color="#ff77ff" />
          <pointLight position={[5, 2, -5]} intensity={0.4} color="#77ffff" />
        </>
      );
    default:
      return <Environment preset="dawn" background={false} />;
  }
};
  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-gray-900 mt-16">
      {/* Enhanced Control Panel */}
      <div className="w-full lg:w-1/4 p-4 bg-gray-800 text-white overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">VR Speech Trainer</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Speech Topic</label>
          <input
            type="text"
            value={speechTopic}
            onChange={(e) => setSpeechTopic(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
            placeholder="Enter your speech topic"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Audience Size: {audienceSize} people</label>
          <input
            type="range"
            min="1"
            max="30"
            value={audienceSize}
            onChange={(e) => setAudienceSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Audience Mood</label>
          <select
            value={audienceMood}
            onChange={(e) => setAudienceMood(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
          >
            <option value="friendly">Friendly</option>
            <option value="neutral">Neutral</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Environment</label>
          <select
            value={environmentPreset}
            onChange={(e) => setEnvironmentPreset(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
          >
            <option value="city">Conference Room</option>
            <option value="dawn">Auditorium</option>
            <option value="sunset">Outdoor Event</option>
            <option value="night">Evening Reception</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Camera Position</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setCameraPosition({x: 0, y: 1.5, z: 5})}
              className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Front View
            </button>
            <button 
              onClick={() => setCameraPosition({x: 5, y: 1.5, z: 0})}
              className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Side View
            </button>
            <button 
              onClick={() => setCameraPosition({x: 0, y: 5, z: 0})}
              className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Top View
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          {!recording ? (
            <button
              onClick={startSpeech}
              className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Start Speech
            </button>
          ) : (
            <button
              onClick={endSpeech}
              className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded"
            >
              End Speech ({Math.floor(speechDuration / 60)}:{(speechDuration % 60).toString().padStart(2, '0')})
            </button>
          )}
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={toggleFullscreen}
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex-1 p-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            {showStats ? "Hide Performance" : "Show Performance"}
          </button>
        </div>
        
        {feedback && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Speech Feedback</h3>
              <button 
                onClick={saveSessionReport}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save Report
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-sm">Pacing</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${feedback.pacing}%` }}></div>
                </div>
                <p className="text-xs text-right">{feedback.pacing}%</p>
              </div>
              <div>
                <p className="text-sm">Clarity</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${feedback.clarity}%` }}></div>
                </div>
                <p className="text-xs text-right">{feedback.clarity}%</p>
              </div>
              <div>
                <p className="text-sm">Confidence</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${feedback.confidence}%` }}></div>
                </div>
                <p className="text-xs text-right">{feedback.confidence}%</p>
              </div>
              <div>
                <p className="text-sm">Eye Contact</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${feedback.eyeContact}%` }}></div>
                </div>
                <p className="text-xs text-right">{feedback.eyeContact}%</p>
              </div>
            </div>
            <h4 className="font-bold text-sm mb-1">Tips:</h4>
            <ul className="text-xs">
              {feedback.tips.map((tip, i) => (
                <li key={i} className="mb-1">• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Enhanced VR View */}
      <div className="w-full lg:w-3/4 h-full relative" ref={canvasRef}>
        <Canvas shadows camera={{ position: [cameraPosition.x, cameraPosition.y, cameraPosition.z], fov: 50 }}>
          {showStats && <Stats />}
          <fog attach="fog" args={['#202060', 5, 30]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
          <spotLight position={[-10, 5, -10]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
          
          <Suspense fallback={<LoadingFallback />}>
            <VirtualRoom 
              audienceSize={audienceSize} 
              audienceMood={audienceMood} 
            />
            <SpeechTimer 
              duration={speechDuration} 
              visible={recording} 
            />
             <Sky sunPosition={[100, 20, 100]} />
             <Environment preset={environmentPreset} background={false} />
          </Suspense>
          
          <OrbitControls
            enableDamping 
            dampingFactor={0.05} 
            minDistance={1} 
            maxDistance={15}
            target={[0, 0.5, 0]}
          />
        </Canvas>
        
        {/* Overlay instructions */}
        {recording && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded">
            Use mouse to look around. Scroll to zoom.
          </div>
        )}
      </div>
    </div>
  );
};

export default VRSpeechTrainer;
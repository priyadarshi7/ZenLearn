import { Badge } from "../ui/badge"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { Pencil, Square, CircleIcon, Type, Eraser, Undo2, Redo2, Save, Download, Share2, Users } from "lucide-react"

export function CommunityWhiteboard({
  communityId
}) {
  const canvasRef = useRef(null)
  const [activeTab, setActiveTab] = useState("whiteboard")
  const [tool, setTool] = useState("pencil")
  const [color, setColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [activeUsers] = useState([
    { id: "u1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "u2", name: "Maria Garcia", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "u3", name: "Current User", avatar: "/placeholder.svg?height=40&width=40" },
  ])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match parent container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    };
  }, [])

  // Drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()

    if (tool === "pencil") {
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "rectangle") {
      // For rectangle, we'll just preview in the final drawing
    } else if (tool === "circle") {
      // For circle, we'll just preview in the final drawing
    } else if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff"
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    setLastX(x)
    setLastY(y)
  }

  const endDrawing = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "rectangle") {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.strokeRect(lastX, lastY, x - lastX, y - lastY)
    } else if (tool === "circle") {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      const radius = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2))
      ctx.beginPath()
      ctx.arc(lastX, lastY, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`
    link.href = dataURL
    link.click()
  }

  return (
    (<div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="whiteboard">Collaborative Whiteboard</TabsTrigger>
          <TabsTrigger value="saved">Saved Whiteboards</TabsTrigger>
        </TabsList>
      </Tabs>
      <TabsContent value="whiteboard" className="mt-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Toolbar */}
          <Card className="md:w-64 flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={tool === "pencil" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("pencil")}
                  title="Pencil">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "rectangle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("rectangle")}
                  title="Rectangle">
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "circle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("circle")}
                  title="Circle">
                  <CircleIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "text" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("text")}
                  title="Text">
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "eraser" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("eraser")}
                  title="Eraser">
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => {}} title="Undo">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => {}} title="Redo">
                  <Redo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear">
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {["#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"].map((clr) => (
                    <button
                      key={clr}
                      className={`h-6 w-6 rounded-full ${color === clr ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                      style={{ backgroundColor: clr }}
                      onClick={() => setColor(clr)} />
                  ))}
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-8 cursor-pointer" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Line Width</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number.parseInt(e.target.value))}
                  className="w-full" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Active Users</label>
                  <Badge className="flex items-center bg-green-500 text-white">
                    <Users className="h-3 w-3 mr-1" />
                    {activeUsers.length}
                  </Badge>
                </div>
                <div className="flex -space-x-2">
                  {activeUsers.map((user) => (
                    <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => {}}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Whiteboard
                </Button>
                <Button variant="outline" onClick={downloadCanvas}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="flex-grow">
            <CardContent className="p-0 h-[500px] relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="saved" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Saved Whiteboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={`/placeholder.svg?height=200&width=300&text=Whiteboard ${i}`}
                      alt={`Saved whiteboard ${i}`}
                      className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium">Whiteboard Session {i}</h3>
                        <p className="text-xs text-muted-foreground">Saved on March {i + 5}, 2025</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>)
  );
}


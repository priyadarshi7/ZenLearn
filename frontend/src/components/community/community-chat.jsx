import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Send, PlusCircle, Smile, Paperclip } from "lucide-react"

// Mock data for chat messages
const MOCK_MESSAGES = [
  {
    id: "m1",
    sender: {
      id: "u1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Hey everyone! Has anyone started working on the database assignment yet?",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "m2",
    sender: {
      id: "u2",
      name: "Maria Garcia",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I've just started looking at it. The ER diagram part seems tricky.",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
  },
  {
    id: "m3",
    sender: {
      id: "u3",
      name: "Sam Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I found a great resource for ER diagrams, let me share the link...",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
  },
  {
    id: "m4",
    sender: {
      id: "u3",
      name: "Sam Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "https://example.com/er-diagram-tutorial",
    timestamp: new Date(Date.now() - 3600000 * 0.98).toISOString(), // 59 minutes ago
  },
  {
    id: "m5",
    sender: {
      id: "u1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Thanks Sam! That's really helpful.",
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 minutes ago
  },
  {
    id: "m6",
    sender: {
      id: "u4",
      name: "Taylor Kim",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I'm stuck on the normalization part. Can anyone help?",
    timestamp: new Date(Date.now() - 60000 * 10).toISOString(), // 10 minutes ago
  },
  {
    id: "m7",
    sender: {
      id: "u2",
      name: "Maria Garcia",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Sure Taylor, I can help with that. Let's set up a quick call after the study session tonight?",
    timestamp: new Date(Date.now() - 60000 * 5).toISOString(), // 5 minutes ago
  },
]

// Mock data for chat channels
const MOCK_CHANNELS = [
  { id: "c1", name: "General", unread: 0 },
  { id: "c2", name: "Homework Help", unread: 3 },
  { id: "c3", name: "Project Collaboration", unread: 0 },
  { id: "c4", name: "Off-Topic", unread: 1 },
  { id: "c5", name: "Resources", unread: 0 },
]

export function CommunityChat({
  communityId
}) {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [channels, setChannels] = useState(MOCK_CHANNELS)
  const [activeChannel, setActiveChannel] = useState("c1")
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: `m${Date.now()}`,
      sender: {
        id: "current-user",
        name: "Current User",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    (<div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
      {/* Channels Sidebar */}
      <Card className="md:col-span-1 h-full">
        <CardHeader>
          <CardTitle className="text-lg">Channels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="px-4 py-2">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannel === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1 relative"
                  onClick={() => setActiveChannel(channel.id)}>
                  <span># {channel.name}</span>
                  {channel.unread > 0 && (
                    <span
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {channel.unread}
                    </span>
                  )}
                </Button>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="px-4 py-2">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Channel
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {/* Chat Area */}
      <Card className="md:col-span-3 h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            # {channels.find((c) => c.id === activeChannel)?.name || "General"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-[460px] px-4">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => {
                // Check if this message is from the same sender as the previous one
                const prevMessage = index > 0 ? messages[index - 1] : null
                const isSameSender = prevMessage && prevMessage.sender.id === message.sender.id
                const isCloseInTime =
                  prevMessage &&
                  new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 300000 // 5 minutes

                const showFullHeader = !isSameSender || !isCloseInTime

                return (
                  (<div key={message.id} className={`${showFullHeader ? "mt-4" : "mt-1"}`}>
                    {showFullHeader ? (
                      <div className="flex items-start gap-3 mb-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                          <AvatarFallback>{message.sender.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-baseline">
                            <span className="font-medium text-sm">{message.sender.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-8"></div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                  </div>)
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex w-full items-center space-x-2">
            <Button variant="outline" size="icon" className="shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow" />
            <Button
              size="icon"
              className="shrink-0"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>)
  );
}


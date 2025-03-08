"use client";
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { ThumbsUp, MessageSquare, Share2, Award, BookOpen, Calendar, ImageIcon, FileText, Send } from "lucide-react"

// Mock data for posts
const MOCK_POSTS = [
  {
    id: "p1",
    author: {
      name: "Jane Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    content:
      "Just uploaded a new set of practice problems for our upcoming algorithm workshop! Check them out in the Learning Paths section.",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    type: "announcement",
  },
  {
    id: "p2",
    author: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Member",
    },
    content:
      "I found this amazing resource for learning about system design. Thought I'd share it with everyone: https://example.com/system-design",
    timestamp: "5 hours ago",
    likes: 18,
    comments: 7,
    type: "resource",
  },
  {
    id: "p3",
    author: {
      name: "Maria Garcia",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Member",
    },
    content:
      "Just completed the 'Advanced Data Structures' learning path! The final challenge was tough but really rewarding.",
    image: "/placeholder.svg?height=300&width=600",
    timestamp: "Yesterday",
    likes: 42,
    comments: 12,
    type: "achievement",
  },
  {
    id: "p4",
    author: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    content:
      "Don't forget about our career panel this Friday! We'll have guests from Google, Microsoft, and several startups discussing career paths in tech.",
    timestamp: "2 days ago",
    likes: 35,
    comments: 8,
    type: "event",
  },
]

export function CommunityFeed({
  communityId
}) {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [newPostContent, setNewPostContent] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return

    const newPost = {
      id: `p${Date.now()}`,
      author: {
        name: "Current User",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Member",
      },
      content: newPostContent,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      type: "post",
    }

    setPosts([newPost, ...posts])
    setNewPostContent("")
  }

  const filteredPosts = activeTab === "all" ? posts : posts.filter((post) => post.type === activeTab)

  const getPostIcon = (type) => {
    switch (type) {
      case "announcement":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "resource":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "achievement":
        return <Award className="h-4 w-4 text-yellow-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return null
    }
  }

  return (
    (<div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Share something with the community..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px]" />
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Document
            </Button>
          </div>
          <Button onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Post
          </Button>
        </CardFooter>
      </Card>
      {/* Feed Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
          <TabsTrigger value="achievement">Achievements</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
        </TabsList>
      </Tabs>
      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.author.name}</span>
                      {post.author.role === "Admin" && (
                        <Badge variant="outline" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      {post.type && getPostIcon(post.type)}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{post.content}</p>
              {post.image && (
                <div className="mt-3">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Post attachment"
                    className="rounded-md max-h-[300px] w-auto object-cover" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex gap-4 w-full">
                <Button variant="ghost" size="sm" className="flex gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex gap-2 ml-auto">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>)
  );
}


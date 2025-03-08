/* eslint-disable no-dupe-keys */
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Progress } from "../ui/progress"
import { Users, MessageSquare, Calendar, Trophy, ArrowRight, ArrowLeft, Crown, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { CommunityFeed } from "./community-feed"
import { CommunityChat } from "./community-chat"
import { CommunityLearningPaths } from "./community-learning-paths"
import { CommunityWhiteboard } from "./community-whiteboard"
import { CommunityEvents } from "./community-events"
import { CommunityLeaderboard } from "./community-leaderboard"

// Mock data for communities
const MOCK_COMMUNITIES = [
  {
    id: "1",
    name: "Computer Science Study Group",
    description: "A community for CS students to collaborate and learn together.",
    members: 128,
    unreadMessages: 5,
    upcomingEvents: 2,
    progress: 75,
    xp: 1250,
    level: 8,
    image: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=240&width=900",
    isPrivate: false,
    admins: ["John Doe", "Jane Smith", "Alex Johnson"],
    learningPaths: [
      { id: "1", title: "Intro to Algorithms", completedSteps: 8, totalSteps: 12, progress: 66 },
      { id: "2", title: "Data Structures", completedSteps: 5, totalSteps: 10, progress: 50 }
    ],
    upcomingEvents: [
      { id: "1", title: "Algorithm Workshop", date: "2025-03-15T14:00:00", attendees: 28 },
      { id: "2", title: "Project Collaboration", date: "2025-03-20T16:30:00", attendees: 15 }
    ],
    leaderboard: [
      { id: "1", name: "User1", avatar: "", xp: 2500 },
      { id: "2", name: "User2", avatar: "", xp: 2200 }
    ]
  },
  {
    id: "2",
    name: "Math Wizards",
    description: "Advanced mathematics problem solving and discussions.",
    members: 64,
    unreadMessages: 0,
    upcomingEvents: 1,
    progress: 45,
    xp: 890,
    level: 5,
    image: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=240&width=900",
    isPrivate: true,
    admins: ["Math Prof", "Number Guy"],
    learningPaths: [
      { id: "1", title: "Calculus", completedSteps: 4, totalSteps: 10, progress: 40 },
      { id: "2", title: "Linear Algebra", completedSteps: 3, totalSteps: 8, progress: 37 }
    ],
    upcomingEvents: [
      { id: "1", title: "Math Contest", date: "2025-03-18T10:00:00", attendees: 20 }
    ],
    leaderboard: [
      { id: "1", name: "MathGenius", avatar: "", xp: 1800 },
      { id: "2", name: "AlgebraKing", avatar: "", xp: 1650 }
    ]
  },
  {
    id: "3",
    name: "Language Learning Hub",
    description: "Practice languages with native speakers and fellow learners.",
    members: 210,
    unreadMessages: 12,
    upcomingEvents: 3,
    progress: 60,
    xp: 1560,
    level: 10,
    image: "/placeholder.svg?height=80&width=80",
    banner: "/placeholder.svg?height=240&width=900",
    isPrivate: false,
    admins: ["Language Pro", "Polyglot Pete"],
    learningPaths: [
      { id: "1", title: "Spanish Beginner", completedSteps: 12, totalSteps: 15, progress: 80 },
      { id: "2", title: "French Intermediate", completedSteps: 6, totalSteps: 12, progress: 50 }
    ],
    upcomingEvents: [
      { id: "1", title: "Spanish Conversation", date: "2025-03-14T18:00:00", attendees: 15 },
      { id: "2", title: "French Movie Night", date: "2025-03-22T19:30:00", attendees: 25 }
    ],
    leaderboard: [
      { id: "1", name: "LinguistPro", avatar: "", xp: 3200 },
      { id: "2", name: "WordMaster", avatar: "", xp: 2900 }
    ]
  },
]

export function MyCommunities() {
  const [communities] = useState(MOCK_COMMUNITIES)
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [activeTab, setActiveTab] = useState("feed")

  const handleCommunityClick = (id) => {
    const community = communities.find(c => c.id === id)
    setSelectedCommunity(community)
  }

  const handleBackClick = () => {
    setSelectedCommunity(null)
  }

  // Community listing view
  if (!selectedCommunity) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card
              key={community.id}
              className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.image} alt={community.name} />
                    <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Badge variant={community.isPrivate ? "secondary" : "outline"}>
                    {community.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{community.name}</CardTitle>
                <CardDescription>{community.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{community.members}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{community.unreadMessages > 0 ? `${community.unreadMessages} new` : "0 new"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{community.upcomingEvents.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                      <span className="text-sm font-medium">Level {community.level}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{community.xp} XP</span>
                  </div>
                  <Progress value={community.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleCommunityClick(community.id)}>
                  Enter Community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Community detail view
  return (
    <div className="min-h-screen bg-background">
      {/* Banner and Community Info */}
      <div
        className="h-48 md:h-64 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${selectedCommunity.banner})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto h-full relative">
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="absolute -bottom-16 left-6 flex items-end">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={selectedCommunity.image} alt={selectedCommunity.name} />
              <AvatarFallback>{selectedCommunity.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{selectedCommunity.name}</h1>
              <div className="flex items-center mt-1">
                <Badge
                  variant={selectedCommunity.isPrivate ? "secondary" : "outline"}
                  className="bg-background/80 backdrop-blur-sm">
                  {selectedCommunity.isPrivate ? "Private" : "Public"}
                </Badge>
                <div className="flex items-center ml-4 text-white/90">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{selectedCommunity.members} members</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Settings className="mr-2 h-4 w-4" />
              Manage
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Admins</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCommunity.admins.map((admin, index) => (
                      <div key={index} className="flex items-center">
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarFallback className="text-xs">{admin.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{admin}</span>
                        {index === 0 && <Crown className="h-3 w-3 ml-1 text-yellow-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Paths</CardTitle>
                <CardDescription>Your current progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCommunity.learningPaths.map((path) => (
                    <div key={path.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">{path.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {path.completedSteps}/{path.totalSteps} steps
                        </span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                  ))}
                </div>
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto"
                  onClick={() => setActiveTab("learning-paths")}>
                  View all learning paths
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCommunity.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start">
                      <div className="bg-muted rounded-md p-2 mr-3 text-center min-w-[48px]">
                        <div className="text-xs font-medium">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        </div>
                        <div className="text-lg font-bold">{new Date(event.date).getDate()}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {" • "}
                          {event.attendees} attending
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto"
                  onClick={() => setActiveTab("events")}>
                  View all events
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="learning-paths">Learning</TabsTrigger>
                <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="feed">
                  <CommunityFeed communityId={selectedCommunity.id} />
                </TabsContent>

                <TabsContent value="chat">
                  <CommunityChat communityId={selectedCommunity.id} />
                </TabsContent>

                <TabsContent value="learning-paths">
                  <CommunityLearningPaths paths={selectedCommunity.learningPaths} />
                </TabsContent>

                <TabsContent value="whiteboard">
                  <CommunityWhiteboard communityId={selectedCommunity.id} />
                </TabsContent>

                <TabsContent value="events">
                  <CommunityEvents events={selectedCommunity.upcomingEvents} />
                </TabsContent>

                <TabsContent value="leaderboard">
                  <CommunityLeaderboard users={selectedCommunity.leaderboard} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
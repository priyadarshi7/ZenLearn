import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { CommunityFeed } from "./community-feed"
import { CommunityChat } from "./community-chat"
import { CommunityLearningPaths } from "./community-learning-paths"
import { CommunityWhiteboard } from "./community-whiteboard"
import { CommunityEvents } from "./community-events"
import { CommunityLeaderboard } from "./community-leaderboard"
import { ArrowLeft, Users, Crown, Settings } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
// import Link from "next/link"

export function CommunityDetail({
  community
}) {
  const [activeTab, setActiveTab] = useState("feed")
  // const [activeTab, setActiveTab] = useState("feed")
  const { id } = useParams() // Get the community ID from URL params
  const navigate = useNavigate() // For navigation
  // const [community, setCommunity] = useState(null)
  return (
    (<div className="min-h-screen bg-background">
      {/* Banner and Community Info */}
      <div
        className="h-48 md:h-64 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${community.banner})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto h-full relative">
          <Link href="/" className="absolute top-4 left-4 z-10">
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="absolute -bottom-16 left-6 flex items-end">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={community.image} alt={community.name} />
              <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{community.name}</h1>
              <div className="flex items-center mt-1">
                <Badge
                  variant={community.isPrivate ? "secondary" : "outline"}
                  className="bg-background/80 backdrop-blur-sm">
                  {community.isPrivate ? "Private" : "Public"}
                </Badge>
                <div className="flex items-center ml-4 text-white/90">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{community.members} members</span>
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
                <p className="text-sm text-muted-foreground">{community.description}</p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Admins</h4>
                  <div className="flex flex-wrap gap-2">
                    {community.admins.map((admin, index) => (
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
                  {community.learningPaths.map((path) => (
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
                  {community.upcomingEvents.map((event) => (
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
                  <CommunityFeed communityId={community.id} />
                </TabsContent>

                <TabsContent value="chat">
                  <CommunityChat communityId={community.id} />
                </TabsContent>

                <TabsContent value="learning-paths">
                  <CommunityLearningPaths paths={community.learningPaths} />
                </TabsContent>

                <TabsContent value="whiteboard">
                  <CommunityWhiteboard communityId={community.id} />
                </TabsContent>

                <TabsContent value="events">
                  <CommunityEvents events={community.upcomingEvents} />
                </TabsContent>

                <TabsContent value="leaderboard">
                  <CommunityLeaderboard users={community.leaderboard} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>)
  );
}


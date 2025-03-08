import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Progress } from "../ui/progress"
import { Trophy, Star, Award, Clock, BookOpen, MessageSquare } from "lucide-react"

// Mock data for user achievements and stats
const MOCK_USER_STATS = {
  u1: {
    achievements: [
      {
        id: "a1",
        title: "Algorithm Master",
        description: "Completed all algorithm challenges",
        icon: <Award className="h-4 w-4 text-yellow-500" />,
      },
      {
        id: "a2",
        title: "Helpful Mentor",
        description: "Helped 10+ community members",
        icon: <Star className="h-4 w-4 text-blue-500" />,
      },
      {
        id: "a3",
        title: "Content Creator",
        description: "Created 5+ learning resources",
        icon: <BookOpen className="h-4 w-4 text-green-500" />,
      },
    ],
    stats: {
      daysActive: 45,
      postsCreated: 23,
      commentsWritten: 87,
      resourcesShared: 12,
      challengesCompleted: 18,
    },
    recentActivity: [
      { type: "completed_challenge", title: "Advanced Sorting Algorithms", date: "2 days ago" },
      { type: "shared_resource", title: "System Design Cheat Sheet", date: "5 days ago" },
      { type: "comment", title: "Commented on 'Database Normalization'", date: "1 week ago" },
    ],
  },
  u2: {
    achievements: [
      {
        id: "a4",
        title: "Consistent Learner",
        description: "Active for 30 consecutive days",
        icon: <Clock className="h-4 w-4 text-purple-500" />,
      },
      {
        id: "a5",
        title: "Community Pillar",
        description: "Among top 5% of contributors",
        icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      },
    ],
    stats: {
      daysActive: 38,
      postsCreated: 15,
      commentsWritten: 92,
      resourcesShared: 8,
      challengesCompleted: 14,
    },
    recentActivity: [
      { type: "completed_path", title: "Completed 'Web Development Basics'", date: "1 day ago" },
      { type: "comment", title: "Commented on 'JavaScript Closures'", date: "3 days ago" },
      { type: "shared_resource", title: "CSS Grid Tutorial", date: "1 week ago" },
    ],
  },
}

// Extended mock data for all users
const MOCK_ALL_USERS = [
  { id: "u1", name: "Alex Johnson", xp: 2450, level: 12, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u2", name: "Maria Garcia", xp: 2120, level: 11, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u3", name: "Sam Wilson", xp: 1890, level: 10, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u4", name: "Taylor Kim", xp: 1760, level: 9, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u5", name: "Jordan Lee", xp: 1540, level: 8, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u6", name: "Emma Davis", xp: 1980, level: 10, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u7", name: "Noah Martinez", xp: 1840, level: 9, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u8", name: "Olivia Wang", xp: 1720, level: 9, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u9", name: "Liam Brown", xp: 1650, level: 8, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u10", name: "Sophia Clark", xp: 1520, level: 8, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u11", name: "Current User", xp: 1350, level: 7, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u12", name: "Ethan Wright", xp: 1280, level: 7, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u13", name: "Ava Rodriguez", xp: 1150, level: 6, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u14", name: "Lucas Thompson", xp: 980, level: 5, avatar: "/placeholder.svg?height=40&width=40" },
  { id: "u15", name: "Isabella Martin", xp: 850, level: 5, avatar: "/placeholder.svg?height=40&width=40" },
]

export function CommunityLeaderboard({
  users: initialUsers
}) {
  const [users] = useState(MOCK_ALL_USERS)
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState("all-time")
  const [statsPeriod, setStatsPeriod] = useState("all-time")

  const handleUserSelect = (userId) => {
    setSelectedUser(userId)
  }

  // Find current user's rank
  const currentUserRank = users.findIndex((user) => user.name === "Current User") + 1

  // Filter users based on active tab
  const getFilteredUsers = () => {
    // In a real app, you would have different data for different time periods
    // Here we'll just return the same data for demonstration
    return users
  }

  const filteredUsers = getFilteredUsers()

  return (
    (<div className="space-y-6">
      {!selectedUser ? (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Your Ranking</CardTitle>
              <CardDescription>
                You are currently ranked #{currentUserRank} out of {users.length} members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-muted rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium">
                    {currentUserRank}
                  </div>
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Your avatar" />
                    <AvatarFallback>YA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Current User</div>
                    <div className="text-xs text-muted-foreground">Level 7</div>
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between text-xs mb-1">
                    <span>1,350 XP</span>
                    <span>1,500 XP needed for Level 8</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>Top community members based on XP and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.slice(0, 10).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleUserSelect(user.id)}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-amber-100 text-amber-700"
                                : "bg-muted"
                        }`}>
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">Level {user.level}</div>
                      </div>
                    </div>

                    <div className="flex-grow text-right">
                      <div className="font-medium">{user.xp.toLocaleString()} XP</div>
                      <div className="flex justify-end gap-1">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {index <= 2 && <Award className="h-4 w-4 text-blue-500" />}
                        {user.name === "Current User" && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedUser(null)}>
              ← Back to Leaderboard
            </button>

            <Tabs value={statsPeriod} onValueChange={setStatsPeriod} className="w-auto">
              <TabsList>
                <TabsTrigger value="all-time">All Time</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={users.find((u) => u.id === selectedUser)?.avatar || ""}
                    alt={users.find((u) => u.id === selectedUser)?.name || ""} />
                  <AvatarFallback>
                    {users.find((u) => u.id === selectedUser)?.name.substring(0, 2) || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{users.find((u) => u.id === selectedUser)?.name}</CardTitle>
                  <CardDescription>
                    Level {users.find((u) => u.id === selectedUser)?.level} •
                    {users.find((u) => u.id === selectedUser)?.xp.toLocaleString()} XP
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {MOCK_USER_STATS[selectedUser] && (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-3">Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {MOCK_USER_STATS[selectedUser].achievements.map((achievement) => (
                        <Card key={achievement.id} className="bg-muted/50">
                          <CardContent className="p-3 flex items-start gap-2">
                            <div className="bg-background rounded-full p-2">{achievement.icon}</div>
                            <div>
                              <h4 className="text-sm font-medium">{achievement.title}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Card className="bg-muted/50">
                        <CardContent className="p-3 text-center">
                          <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                          <div className="text-lg font-bold">
                            {MOCK_USER_STATS[selectedUser].stats.daysActive}
                          </div>
                          <div className="text-xs text-muted-foreground">Days Active</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-3 text-center">
                          <BookOpen className="h-5 w-5 mx-auto mb-1 text-green-500" />
                          <div className="text-lg font-bold">
                            {MOCK_USER_STATS[selectedUser].stats.postsCreated}
                          </div>
                          <div className="text-xs text-muted-foreground">Posts Created</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-3 text-center">
                          <MessageSquare className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                          <div className="text-lg font-bold">
                            {MOCK_USER_STATS[selectedUser].stats.commentsWritten}
                          </div>
                          <div className="text-xs text-muted-foreground">Comments</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-3 text-center">
                          <BookOpen className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                          <div className="text-lg font-bold">
                            {MOCK_USER_STATS[selectedUser].stats.resourcesShared}
                          </div>
                          <div className="text-xs text-muted-foreground">Resources Shared</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-3 text-center">
                          <Award className="h-5 w-5 mx-auto mb-1 text-red-500" />
                          <div className="text-lg font-bold">
                            {MOCK_USER_STATS[selectedUser].stats.challengesCompleted}
                          </div>
                          <div className="text-xs text-muted-foreground">Challenges Completed</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {MOCK_USER_STATS[selectedUser].recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-muted rounded-full p-2">
                            {activity.type === "completed_challenge" && <Award className="h-4 w-4 text-yellow-500" />}
                            {activity.type === "shared_resource" && <BookOpen className="h-4 w-4 text-green-500" />}
                            {activity.type === "comment" && <MessageSquare className="h-4 w-4 text-blue-500" />}
                            {activity.type === "completed_path" && <Trophy className="h-4 w-4 text-purple-500" />}
                          </div>
                          <div>
                            <div className="text-sm">{activity.title}</div>
                            <div className="text-xs text-muted-foreground">{activity.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!MOCK_USER_STATS[selectedUser] && (
                <div className="text-center py-6 text-muted-foreground">
                  Detailed stats not available for this user.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>)
  );
}


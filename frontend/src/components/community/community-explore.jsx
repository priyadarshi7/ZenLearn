import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Users, Search, Filter } from "lucide-react"

// Mock data for communities
const MOCK_COMMUNITIES = [
  {
    id: "4",
    name: "Physics Enthusiasts",
    description: "Explore the wonders of physics from quantum to cosmology.",
    members: 156,
    category: "Science",
    tags: ["Physics", "Science", "Academic"],
    image: "/placeholder.svg?height=80&width=80",
    isPrivate: false,
  },
  {
    id: "5",
    name: "Literature Club",
    description: "Discuss classic and contemporary literature with fellow book lovers.",
    members: 89,
    category: "Arts & Humanities",
    tags: ["Books", "Literature", "Discussion"],
    image: "/placeholder.svg?height=80&width=80",
    isPrivate: false,
  },
  {
    id: "6",
    name: "Pre-Med Study Group",
    description: "Support group for pre-med students preparing for MCAT and applications.",
    members: 112,
    category: "Medicine",
    tags: ["Pre-Med", "MCAT", "Medical School"],
    image: "/placeholder.svg?height=80&width=80",
    isPrivate: true,
  },
  {
    id: "7",
    name: "Coding Bootcamp",
    description: "Intensive programming practice and project collaboration.",
    members: 203,
    category: "Technology",
    tags: ["Coding", "Programming", "Projects"],
    image: "/placeholder.svg?height=80&width=80",
    isPrivate: false,
  },
  {
    id: "8",
    name: "Research Methodology",
    description: "Learn and share best practices in academic research.",
    members: 76,
    category: "Academic",
    tags: ["Research", "Methodology", "Academic"],
    image: "/placeholder.svg?height=80&width=80",
    isPrivate: true,
  },
]

export function CommunityExplore() {
  const [communities] = useState(MOCK_COMMUNITIES)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || community.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    (<div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
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
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Users className="h-4 w-4 mr-1" />
                <span>{community.members} members</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant={community.isPrivate ? "outline" : "default"} className="w-full">
                {community.isPrivate ? "Request to Join" : "Join Community"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>)
  );
}


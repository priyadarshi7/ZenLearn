"use client";
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Calendar, Clock, MapPin, Users, Video, Plus } from "lucide-react"

// Mock data for event details
const MOCK_EVENT_DETAILS = {
  e1: {
    title: "Algorithm Workshop",
    description: "A hands-on workshop covering advanced algorithm techniques and problem-solving strategies.",
    date: "2025-03-15T14:00:00",
    endDate: "2025-03-15T16:00:00",
    location: "Online",
    isVirtual: true,
    meetingLink: "https://meet.example.com/algorithm-workshop",
    host: {
      name: "Jane Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    attendees: [
      { id: "u1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u2", name: "Maria Garcia", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u3", name: "Sam Wilson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u4", name: "Taylor Kim", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u5", name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u6", name: "Emma Davis", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u7", name: "Noah Martinez", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u8", name: "Olivia Wang", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u9", name: "Liam Brown", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u10", name: "Sophia Clark", avatar: "/placeholder.svg?height=40&width=40" },
      // More attendees...
    ],
  },
  e2: {
    title: "Career Panel: Tech Industry",
    description:
      "Join us for a panel discussion with industry professionals about career paths and opportunities in tech.",
    date: "2025-03-20T18:00:00",
    endDate: "2025-03-20T20:00:00",
    location: "Online",
    isVirtual: true,
    meetingLink: "https://meet.example.com/career-panel",
    host: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    attendees: [
      { id: "u1", name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u2", name: "Maria Garcia", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u3", name: "Sam Wilson", avatar: "/placeholder.svg?height=40&width=40" },
      // More attendees...
    ],
  },
  e3: {
    title: "Problem Solving Session",
    description: "Weekly problem-solving session focusing on mathematical challenges and puzzles.",
    date: "2025-03-12T16:00:00",
    endDate: "2025-03-12T18:00:00",
    location: "Math Building, Room 101",
    isVirtual: false,
    host: {
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    attendees: [
      { id: "u6", name: "Emma Davis", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u7", name: "Noah Martinez", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u8", name: "Olivia Wang", avatar: "/placeholder.svg?height=40&width=40" },
      // More attendees...
    ],
  },
  e4: {
    title: "Math Competition Prep",
    description: "Preparation session for the upcoming regional mathematics competition.",
    date: "2025-03-18T15:00:00",
    endDate: "2025-03-18T17:00:00",
    location: "Math Building, Room 203",
    isVirtual: false,
    host: {
      name: "Maya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    attendees: [
      { id: "u9", name: "Liam Brown", avatar: "/placeholder.svg?height=40&width=40" },
      { id: "u10", name: "Sophia Clark", avatar: "/placeholder.svg?height=40&width=40" },
      // More attendees...
    ],
  },
}

// Add more mock events
const MOCK_ADDITIONAL_EVENTS = [
  {
    id: "e5",
    title: "Study Group: Midterm Prep",
    date: "2025-03-25T17:00:00",
    attendees: 15,
  },
  {
    id: "e6",
    title: "Guest Lecture: AI Ethics",
    date: "2025-04-02T13:00:00",
    attendees: 38,
  },
  {
    id: "e7",
    title: "Hackathon Planning Meeting",
    date: "2025-03-28T16:00:00",
    attendees: 12,
  },
]

export function CommunityEvents({
  events: initialEvents
}) {
  const [events, setEvents] = useState([...initialEvents, ...MOCK_ADDITIONAL_EVENTS])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isAttending, setIsAttending] = useState({})

  const handleAttendClick = (eventId) => {
    setIsAttending((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))
  }

  const formatEventDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const formatEventTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  }

  const isPast = (dateString) => {
    return new Date(dateString) < new Date();
  }

  const filteredEvents = events.filter((event) => {
    if (activeTab === "upcoming") {
      return isUpcoming(event.date);
    } else if (activeTab === "past") {
      return isPast(event.date);
    } else if (activeTab === "attending") {
      return isAttending[event.id]
    }
    return true
  })

  return (
    (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Events</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create a New Event</DialogTitle>
              <DialogDescription>Schedule an event for your community members.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Event creation form would go here */}
              <p className="text-sm text-muted-foreground">Event creation form placeholder</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="attending">Attending</TabsTrigger>
        </TabsList>
      </Tabs>
      {selectedEvent ? (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedEvent(null)}>
            Back to All Events
          </Button>

          {MOCK_EVENT_DETAILS[selectedEvent] && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{MOCK_EVENT_DETAILS[selectedEvent].title}</CardTitle>
                    <CardDescription>
                      {MOCK_EVENT_DETAILS[selectedEvent].description}
                    </CardDescription>
                  </div>
                  <Badge variant={isAttending[selectedEvent] ? "default" : "outline"}>
                    {isAttending[selectedEvent] ? "Attending" : "Not Attending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {formatEventDate(MOCK_EVENT_DETAILS[selectedEvent].date)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {formatEventTime(MOCK_EVENT_DETAILS[selectedEvent].date)} -
                          {formatEventTime(MOCK_EVENT_DETAILS[selectedEvent].endDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{MOCK_EVENT_DETAILS[selectedEvent].location}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {MOCK_EVENT_DETAILS[selectedEvent].attendees.length}{" "}
                          attending
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={MOCK_EVENT_DETAILS[selectedEvent].host.avatar} />
                          <AvatarFallback>
                            {MOCK_EVENT_DETAILS[selectedEvent].host.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          Hosted by {MOCK_EVENT_DETAILS[selectedEvent].host.name}
                        </span>
                      </div>
                      {MOCK_EVENT_DETAILS[selectedEvent].isVirtual && (
                        <div className="flex items-center text-sm">
                          <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Virtual Event</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Attendees</h3>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_EVENT_DETAILS[selectedEvent].attendees
                        .slice(0, 10)
                        .map((attendee) => (
                          <Avatar
                            key={attendee.id}
                            className="h-8 w-8 border-2 border-background"
                            title={attendee.name}>
                            <AvatarImage src={attendee.avatar} alt={attendee.name} />
                            <AvatarFallback>{attendee.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                        ))}
                      {MOCK_EVENT_DETAILS[selectedEvent].attendees.length > 10 && (
                        <div
                          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          +{MOCK_EVENT_DETAILS[selectedEvent].attendees.length - 10}
                        </div>
                      )}
                    </div>
                  </div>

                  {MOCK_EVENT_DETAILS[selectedEvent].isVirtual && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Meeting Link</h3>
                      <div className="bg-muted p-2 rounded-md text-sm">
                        <a
                          href={MOCK_EVENT_DETAILS[selectedEvent].meetingLink}
                          className="text-blue-500 hover:underline">
                          {MOCK_EVENT_DETAILS[selectedEvent].meetingLink}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1"
                    variant={isAttending[selectedEvent] ? "outline" : "default"}
                    onClick={() => handleAttendClick(selectedEvent)}>
                    {isAttending[selectedEvent] ? "Cancel Attendance" : "Attend Event"}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Add to Calendar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="bg-muted rounded-md p-2 text-center min-w-[48px]">
                    <div className="text-xs font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <div className="text-lg font-bold">{new Date(event.date).getDate()}</div>
                  </div>
                  <Badge variant={isAttending[event.id] ? "default" : "outline"}>
                    {isAttending[event.id] ? "Attending" : "Not Attending"}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{event.title}</CardTitle>
                <CardDescription>
                  {formatEventTime(event.date)} • {event.attendees} attending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{MOCK_EVENT_DETAILS[event.id]?.location || "Online"}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAttendClick(event.id)}>
                  {isAttending[event.id] ? "Cancel" : "Attend"}
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => setSelectedEvent(event.id)}>
                  Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>)
  );
}


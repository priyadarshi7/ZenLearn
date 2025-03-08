"use client";
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { CheckCircle2, Circle, BookOpen, Award, Clock, ArrowRight, Play } from "lucide-react"

// Mock data for learning path details
const MOCK_PATH_DETAILS = {
  lp1: {
    title: "Algorithms Mastery",
    description:
      "Master fundamental algorithms and data structures essential for technical interviews and efficient problem solving.",
    duration: "8 weeks",
    difficulty: "Intermediate",
    prerequisites: ["Basic programming knowledge", "Understanding of time complexity"],
    modules: [
      {
        id: "m1",
        title: "Sorting Algorithms",
        completed: true,
        steps: [
          { id: "s1", title: "Bubble Sort", completed: true, type: "video" },
          { id: "s2", title: "Quick Sort", completed: true, type: "reading" },
          { id: "s3", title: "Merge Sort", completed: true, type: "practice" },
        ],
      },
      {
        id: "m2",
        title: "Search Algorithms",
        completed: true,
        steps: [
          { id: "s4", title: "Linear Search", completed: true, type: "video" },
          { id: "s5", title: "Binary Search", completed: true, type: "practice" },
        ],
      },
      {
        id: "m3",
        title: "Graph Algorithms",
        completed: false,
        steps: [
          { id: "s6", title: "Breadth-First Search", completed: true, type: "video" },
          { id: "s7", title: "Depth-First Search", completed: true, type: "reading" },
          { id: "s8", title: "Dijkstra's Algorithm", completed: false, type: "practice" },
          { id: "s9", title: "A* Search Algorithm", completed: false, type: "project" },
        ],
      },
      {
        id: "m4",
        title: "Dynamic Programming",
        completed: false,
        steps: [
          { id: "s10", title: "Introduction to DP", completed: true, type: "video" },
          { id: "s11", title: "Fibonacci Sequence", completed: false, type: "practice" },
          { id: "s12", title: "Knapsack Problem", completed: false, type: "practice" },
        ],
      },
    ],
  },
  lp2: {
    title: "Web Development Fundamentals",
    description: "Learn the core technologies and concepts behind modern web development.",
    duration: "10 weeks",
    difficulty: "Beginner",
    prerequisites: ["Basic HTML knowledge"],
    modules: [
      {
        id: "m5",
        title: "HTML & CSS Basics",
        completed: true,
        steps: [
          { id: "s13", title: "HTML Structure", completed: true, type: "video" },
          { id: "s14", title: "CSS Styling", completed: true, type: "practice" },
          { id: "s15", title: "Responsive Design", completed: true, type: "project" },
        ],
      },
      {
        id: "m6",
        title: "JavaScript Fundamentals",
        completed: false,
        steps: [
          { id: "s16", title: "Variables & Data Types", completed: true, type: "video" },
          { id: "s17", title: "Functions & Scope", completed: true, type: "reading" },
          { id: "s18", title: "DOM Manipulation", completed: false, type: "practice" },
          { id: "s19", title: "Event Handling", completed: false, type: "practice" },
        ],
      },
      {
        id: "m7",
        title: "Frontend Frameworks",
        completed: false,
        steps: [
          { id: "s20", title: "Introduction to React", completed: false, type: "video" },
          { id: "s21", title: "Components & Props", completed: false, type: "practice" },
          { id: "s22", title: "State Management", completed: false, type: "project" },
        ],
      },
    ],
  },
}

export function CommunityLearningPaths({
  paths
}) {
  const [selectedPath, setSelectedPath] = useState(null)
  const [activeTab, setActiveTab] = useState("in-progress")

  const handlePathSelect = (pathId) => {
    setSelectedPath(pathId)
  }

  const getStepIcon = (type) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "reading":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "practice":
        return <Award className="h-4 w-4 text-yellow-500" />;
      case "project":
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  }

  const filteredPaths = paths.filter((path) => {
    if (activeTab === "in-progress") {
      return path.progress > 0 && path.progress < 100
    } else if (activeTab === "completed") {
      return path.progress === 100
    } else if (activeTab === "not-started") {
      return path.progress === 0
    }
    return true
  })

  return (
    (<div>
      {!selectedPath ? (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All Paths</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="not-started">Not Started</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPaths.map((path) => (
              <Card
                key={path.id}
                className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{path.title}</CardTitle>
                  <CardDescription>
                    {MOCK_PATH_DETAILS[path.id]?.description ||
                      "A learning path for students"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {MOCK_PATH_DETAILS[path.id]?.duration || "Unknown duration"}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {MOCK_PATH_DETAILS[path.id]?.difficulty || "Beginner"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {path.completedSteps}/{path.totalSteps} steps
                        </span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handlePathSelect(path.id)}>
                    {path.progress === 0 ? "Start Path" : "Continue Learning"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedPath(null)}>
            Back to All Paths
          </Button>

          {selectedPath && MOCK_PATH_DETAILS[selectedPath] && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{MOCK_PATH_DETAILS[selectedPath].title}</CardTitle>
                    <CardDescription>
                      {MOCK_PATH_DETAILS[selectedPath].description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {MOCK_PATH_DETAILS[selectedPath].difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Prerequisites</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {MOCK_PATH_DETAILS[selectedPath].prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Progress</h3>
                    <Progress
                      value={paths.find((p) => p.id === selectedPath)?.progress || 0}
                      className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Modules</h3>
                    <Accordion type="multiple" className="w-full">
                      {MOCK_PATH_DETAILS[selectedPath].modules.map((module) => (
                        <AccordionItem key={module.id} value={module.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center">
                              {module.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <Circle className="h-4 w-4 mr-2" />
                              )}
                              <span>{module.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-6 space-y-2 py-2">
                              {module.steps.map((step) => (
                                <div key={step.id} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {step.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                    ) : (
                                      <Circle className="h-4 w-4 mr-2" />
                                    )}
                                    <span className="text-sm">{step.title}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="mr-2">
                                      {getStepIcon(step.type)}
                                      <span className="ml-1 capitalize">{step.type}</span>
                                    </Badge>
                                    <Button size="sm" variant="ghost">
                                      {step.completed ? "Review" : "Start"}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>)
  );
}


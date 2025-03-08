"use client";
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Upload, ImageIcon } from "lucide-react"

export function CreateCommunityDialog({
  open,
  onOpenChange
}) {
  const [communityName, setCommunityName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [joinType, setJoinType] = useState("open")
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=100&width=100")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would send the data to your API
    console.log({
      name: communityName,
      description,
      isPrivate,
      joinType,
      avatarUrl,
    })

    setIsSubmitting(false)
    onOpenChange(false)

    // Reset form
    setCommunityName("")
    setDescription("")
    setIsPrivate(false)
    setJoinType("open")
    setAvatarUrl("/placeholder.svg?height=100&width=100")
  }

  return (
    (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
            <DialogDescription>Create a space for students to collaborate, learn, and grow together.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt="Community avatar" />
                <AvatarFallback>
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>

              <Button type="button" variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                placeholder="e.g., Physics Study Group"
                required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
                required />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private-switch">Private Community</Label>
                <p className="text-sm text-muted-foreground">Private communities won't appear in search results</p>
              </div>
              <Switch id="private-switch" checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            <div className="space-y-3">
              <Label>Who can join?</Label>
              <RadioGroup value={joinType} onValueChange={setJoinType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="open" id="open" />
                  <Label htmlFor="open" className="cursor-pointer">
                    Anyone can join
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approval" id="approval" />
                  <Label htmlFor="approval" className="cursor-pointer">
                    Requires admin approval
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite" id="invite" />
                  <Label htmlFor="invite" className="cursor-pointer">
                    Invite only
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>)
  );
}


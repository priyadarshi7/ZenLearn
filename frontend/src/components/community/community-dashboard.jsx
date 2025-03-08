import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { CommunityExplore } from "./community-explore"
import { MyCommunities } from "./my-communities"
import { CreateCommunityDialog } from "./create-community-dialog"
import { Button } from "../ui/button"
import { PlusCircle } from "lucide-react"

export function CommunityDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    (<div className="container mx-auto py-6 space-y-8 mt-16 ">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Communities</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </div>
      <Tabs defaultValue="my-communities" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          <TabsTrigger value="explore">Explore</TabsTrigger>
        </TabsList>
        <TabsContent value="my-communities" className="mt-6">
          <MyCommunities />
        </TabsContent>
        <TabsContent value="explore" className="mt-6">
          <CommunityExplore />
        </TabsContent>
      </Tabs>
      <CreateCommunityDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>)
  );
}


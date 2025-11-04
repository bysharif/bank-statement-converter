import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function StarredPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Starred Files</h1>
        <p className="text-muted-foreground">
          Quick access to your favorite bank statements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            No Starred Files Yet
          </CardTitle>
          <CardDescription>
            Star your frequently accessed bank statements for quick access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            When you star files from your conversion history, they will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

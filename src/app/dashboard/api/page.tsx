import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Code } from "lucide-react"

export default function ApiPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground">
          Integrate bank statement conversion into your applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Integration
          </CardTitle>
          <CardDescription>
            Access our API to programmatically convert bank statements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            API documentation coming soon. You'll be able to integrate bank statement conversion directly into your applications using our REST API.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

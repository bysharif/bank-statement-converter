import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, HelpCircle } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground">
          Get help and learn how to use the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Getting Started
          </CardTitle>
          <CardDescription>
            Learn how to convert your bank statements quickly and easily.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">How to Convert a Bank Statement</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click "Upload New Statement" from the dashboard</li>
                <li>Select your bank statement PDF file</li>
                <li>Wait for the conversion to complete (usually 10-30 seconds)</li>
                <li>Download your converted Excel file</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Contact support for assistance with your bank statement conversions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

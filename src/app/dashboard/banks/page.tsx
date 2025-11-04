import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function BanksPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supported Banks</h1>
        <p className="text-muted-foreground">
          View all banks and financial institutions we support
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Supported Financial Institutions
          </CardTitle>
          <CardDescription>
            We support major UK banks and continuously add more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Currently supported banks include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>HSBC</li>
            <li>Lloyds Bank</li>
            <li>Monzo</li>
            <li>NatWest</li>
            <li>Revolut</li>
            <li>Santander</li>
            <li>Anna Money</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

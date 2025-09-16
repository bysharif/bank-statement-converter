'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartDataPoint } from "@/types/dashboard"

// Mock data for the last 30 days
const mockChartData: ChartDataPoint[] = [
  { date: "2024-02-15", conversions: 5 },
  { date: "2024-02-16", conversions: 8 },
  { date: "2024-02-17", conversions: 3 },
  { date: "2024-02-18", conversions: 12 },
  { date: "2024-02-19", conversions: 7 },
  { date: "2024-02-20", conversions: 15 },
  { date: "2024-02-21", conversions: 9 },
  { date: "2024-02-22", conversions: 6 },
  { date: "2024-02-23", conversions: 11 },
  { date: "2024-02-24", conversions: 4 },
  { date: "2024-02-25", conversions: 13 },
  { date: "2024-02-26", conversions: 8 },
  { date: "2024-02-27", conversions: 16 },
  { date: "2024-02-28", conversions: 10 },
  { date: "2024-02-29", conversions: 14 },
  { date: "2024-03-01", conversions: 7 },
  { date: "2024-03-02", conversions: 9 },
  { date: "2024-03-03", conversions: 12 },
  { date: "2024-03-04", conversions: 6 },
  { date: "2024-03-05", conversions: 18 },
  { date: "2024-03-06", conversions: 11 },
  { date: "2024-03-07", conversions: 8 },
  { date: "2024-03-08", conversions: 15 },
  { date: "2024-03-09", conversions: 13 },
  { date: "2024-03-10", conversions: 9 },
  { date: "2024-03-11", conversions: 17 },
  { date: "2024-03-12", conversions: 12 },
  { date: "2024-03-13", conversions: 14 },
  { date: "2024-03-14", conversions: 10 },
  { date: "2024-03-15", conversions: 16 },
]

// Simple line chart component (would use recharts or similar in production)
function SimpleLineChart({ data }: { data: ChartDataPoint[] }) {
  const maxValue = Math.max(...data.map(d => d.conversions))
  const chartHeight = 200
  const chartWidth = 400

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth
    const y = chartHeight - (point.conversions / maxValue) * chartHeight
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full h-[200px] flex items-center justify-center">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Chart line */}
        <polyline
          fill="none"
          stroke="#1e40af"
          strokeWidth="2"
          points={points}
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * chartWidth
          const y = chartHeight - (point.conversions / maxValue) * chartHeight
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#1e40af"
              className="hover:r-4 transition-all cursor-pointer"
            >
              <title>{`${point.date}: ${point.conversions} conversions`}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

export function UsageChart() {
  const totalConversions = mockChartData.reduce((sum, day) => sum + day.conversions, 0)
  const avgPerDay = (totalConversions / mockChartData.length).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Usage Overview</CardTitle>
        <CardDescription>
          Daily conversions over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-uk-blue-600">{totalConversions}</div>
              <div className="text-sm text-muted-foreground">Total Conversions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-uk-blue-600">{avgPerDay}</div>
              <div className="text-sm text-muted-foreground">Daily Average</div>
            </div>
          </div>

          <SimpleLineChart data={mockChartData} />

          <div className="text-xs text-muted-foreground text-center">
            Hover over points to see daily values
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
import { Zap } from "lucide-react"

interface CompanyLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CompanyLogo({ size = "md", className }: CompanyLogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-6 h-6",
      svg: "w-4 h-4",
      indicator: "w-2.5 h-2.5 -top-0.5 -right-0.5",
      zap: "w-1.5 h-1.5"
    },
    md: {
      container: "w-8 h-8",
      svg: "w-5 h-5",
      indicator: "w-3 h-3 -top-0.5 -right-0.5",
      zap: "w-2 h-2"
    },
    lg: {
      container: "w-10 h-10",
      svg: "w-6 h-6",
      indicator: "w-4 h-4 -top-1 -right-1",
      zap: "w-2.5 h-2.5"
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes.container} bg-gradient-to-br from-uk-blue-600 to-uk-blue-700 rounded-lg flex items-center justify-center shadow-lg`}>
        <svg className={`${sizes.svg} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className={`absolute ${sizes.indicator} bg-uk-green-500 rounded-full flex items-center justify-center`}>
        <Zap className={`${sizes.zap} text-white`} />
      </div>
    </div>
  )
}
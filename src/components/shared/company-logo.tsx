import Image from "next/image"

interface CompanyLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CompanyLogo({ size = "md", className }: CompanyLogoProps) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 60
  }

  const pixelSize = sizeMap[size]

  return (
    <div className={`relative ${className}`}>
      <Image
        src="/logo.svg"
        alt="ConvertBank-Statement Logo"
        width={pixelSize}
        height={pixelSize}
        className="object-contain"
      />
    </div>
  )
}

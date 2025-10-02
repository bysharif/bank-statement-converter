'use client'

import { useEffect, useRef } from 'react'

const ukBanks = [
  { name: 'HSBC', logo: 'https://logo.clearbit.com/hsbc.com' },
  { name: 'Lloyds Banking Group', logo: 'https://logo.clearbit.com/lloydsbank.com' },
  { name: 'Barclays', logo: 'https://logo.clearbit.com/barclays.com' },
  { name: 'NatWest', logo: 'https://logo.clearbit.com/natwest.com' },
  { name: 'Santander UK', logo: 'https://logo.clearbit.com/santander.co.uk' },
  { name: 'TSB', logo: 'https://logo.clearbit.com/tsb.co.uk' },
  { name: 'Nationwide', logo: 'https://logo.clearbit.com/nationwide.co.uk' },
  { name: 'Virgin Money', logo: 'https://logo.clearbit.com/virginmoney.com' },
  { name: 'Metro Bank', logo: 'https://logo.clearbit.com/metrobankonline.co.uk' },
  { name: 'Monzo', logo: 'https://logo.clearbit.com/monzo.com' },
  { name: 'Starling Bank', logo: 'https://logo.clearbit.com/starlingbank.com' },
  { name: 'Revolut', logo: 'https://logo.clearbit.com/revolut.com' },
  { name: 'Halifax', logo: 'https://logo.clearbit.com/halifax.co.uk' },
  { name: 'First Direct', logo: 'https://logo.clearbit.com/firstdirect.com' },
  { name: 'Co-operative Bank', logo: 'https://logo.clearbit.com/co-operativebank.co.uk' },
  { name: 'Handelsbanken', logo: 'https://logo.clearbit.com/handelsbanken.co.uk' },
  { name: 'Aldermore', logo: 'https://logo.clearbit.com/aldermore.co.uk' },
  { name: 'Shawbrook Bank', logo: 'https://logo.clearbit.com/shawbrook.co.uk' },
  { name: 'OneSavings Bank', logo: 'https://logo.clearbit.com/osb.co.uk' },
  { name: 'Cynergy Bank', logo: 'https://logo.clearbit.com/cynergybank.co.uk' },
  { name: 'Allica Bank', logo: 'https://logo.clearbit.com/allicabank.co.uk' },
  { name: 'OakNorth Bank', logo: 'https://logo.clearbit.com/oaknorth.com' },
  { name: 'Tide', logo: 'https://logo.clearbit.com/tide.co' },
  { name: 'Anna Money', logo: 'https://logo.clearbit.com/anna.money' },
  { name: 'Cashplus', logo: 'https://logo.clearbit.com/cashplus.com' },
  { name: 'RBS', logo: 'https://logo.clearbit.com/rbs.co.uk' },
  { name: 'Ulster Bank', logo: 'https://logo.clearbit.com/ulsterbank.co.uk' },
  { name: 'Bank of Scotland', logo: 'https://logo.clearbit.com/bankofscotland.co.uk' },
  { name: 'Yorkshire Bank', logo: 'https://logo.clearbit.com/ybonline.co.uk' },
  { name: 'Clydesdale Bank', logo: 'https://logo.clearbit.com/cybg.com' }
]

export function BankCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollAmount = 0
    const scrollStep = 1
    const maxScroll = scrollContainer.scrollWidth / 2

    const scroll = () => {
      scrollAmount += scrollStep
      if (scrollAmount >= maxScroll) {
        scrollAmount = 0
      }
      scrollContainer.scrollLeft = scrollAmount
    }

    const intervalId = setInterval(scroll, 30)
    return () => clearInterval(intervalId)
  }, [])

  // Duplicate the banks array to create seamless infinite scroll
  const duplicatedBanks = [...ukBanks, ...ukBanks]

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-hidden whitespace-nowrap"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedBanks.map((bank, index) => (
          <div
            key={`${bank.name}-${index}`}
            className="flex-shrink-0 h-12 px-6 bg-gray-50 rounded-lg flex items-center justify-center gap-2 border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
            style={{ minWidth: 'fit-content' }}
          >
            <img
              src={bank.logo}
              alt={`${bank.name} logo`}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {bank.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
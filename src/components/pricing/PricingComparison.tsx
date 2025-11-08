import { Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PLAN_FEATURES } from '@/types/subscription'

export function PricingComparison() {
  const features = [
    {
      category: 'Conversions',
      items: [
        {
          name: 'Monthly conversions',
          free: '5',
          starter: '50',
          professional: '150',
          business: '500',
        },
      ],
    },
    {
      category: 'Export Formats',
      items: [
        {
          name: 'CSV export',
          free: true,
          starter: true,
          professional: true,
          business: true,
        },
        {
          name: 'Excel export',
          free: false,
          starter: false,
          professional: true,
          business: true,
        },
        {
          name: 'QuickBooks (QBO/QFX)',
          free: false,
          starter: false,
          professional: true,
          business: true,
        },
        {
          name: 'JSON API export',
          free: false,
          starter: false,
          professional: false,
          business: true,
        },
      ],
    },
    {
      category: 'Features',
      items: [
        {
          name: 'Transaction categorization',
          free: false,
          starter: false,
          professional: true,
          business: true,
        },
        {
          name: 'QuickBooks/Xero integration',
          free: false,
          starter: false,
          professional: true,
          business: true,
        },
        {
          name: 'Batch processing',
          free: false,
          starter: false,
          professional: false,
          business: true,
        },
        {
          name: 'Advanced analytics',
          free: false,
          starter: false,
          professional: false,
          business: true,
        },
        {
          name: 'API access',
          free: false,
          starter: false,
          professional: false,
          business: true,
        },
      ],
    },
    {
      category: 'Support & Storage',
      items: [
        {
          name: 'Data retention',
          free: '7 days',
          starter: '30 days',
          professional: '1 year',
          business: '2 years',
        },
        {
          name: 'Support level',
          free: 'Email',
          starter: 'Email',
          professional: 'Priority',
          business: 'Dedicated',
        },
      ],
    },
  ]

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Feature</TableHead>
            <TableHead className="text-center">Free</TableHead>
            <TableHead className="text-center">Starter</TableHead>
            <TableHead className="text-center bg-uk-blue-50">
              Professional
            </TableHead>
            <TableHead className="text-center">Business</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((category) => (
            <>
              <TableRow key={category.category} className="bg-muted/50">
                <TableCell colSpan={5} className="font-semibold">
                  {category.category}
                </TableCell>
              </TableRow>
              {category.items.map((item, index) => (
                <TableRow key={`${category.category}-${index}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">
                    {renderCell(item.free)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderCell(item.starter)}
                  </TableCell>
                  <TableCell className="text-center bg-uk-blue-50">
                    {renderCell(item.professional)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderCell(item.business)}
                  </TableCell>
                </TableRow>
              ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function renderCell(value: boolean | string | number) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-uk-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-gray-300 mx-auto" />
    )
  }
  return <span className="text-sm">{value}</span>
}

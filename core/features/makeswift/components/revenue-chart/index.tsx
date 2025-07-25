'use client'

import { useState } from 'react'

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number }>
  height?: number
}

export default function RevenueChart({ 
  data = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 88000 },
    { month: 'Apr', revenue: 105000 },
    { month: 'May', revenue: 98000 },
    { month: 'Jun', revenue: 125000 }
  ],
  height = 200
}: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const minRevenue = Math.min(...data.map(d => d.revenue))
  const range = maxRevenue - minRevenue

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => {
          const heightPercent = range > 0 ? ((item.revenue - minRevenue) / range) * 100 : 50
          const barHeight = (heightPercent / 100) * (height - 40) + 20
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-500 mb-2">
                {formatCurrency(item.revenue)}
              </div>
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${barHeight}px` }}
              />
              <div className="text-xs text-gray-600 mt-2">
                {item.month}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 
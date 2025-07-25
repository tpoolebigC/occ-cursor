'use client'

import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface GrowthMetricProps {
  currentValue?: number
  previousValue?: number
  period?: string
  title?: string
}

export default function GrowthMetric({ 
  currentValue = 13.6,
  previousValue = 8.2,
  period = 'This Month',
  title = 'Growth Rate'
}: GrowthMetricProps) {
  const change = currentValue - previousValue
  const changePercent = ((change / previousValue) * 100).toFixed(1)
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{currentValue}%</p>
        </div>
        <div className="p-3 bg-orange-100 rounded-full">
          <BarChart3 className="h-6 w-6 text-orange-600" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{changePercent}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs {period}</span>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-gray-500">
          Previous: {previousValue}%
        </p>
      </div>
    </div>
  )
} 
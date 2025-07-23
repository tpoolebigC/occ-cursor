'use client'

import { useState } from 'react'
import { User, Building, Settings, Shield, CreditCard, Bell } from 'lucide-react'

interface AccountNavigationProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export default function AccountNavigation({ 
  activeSection = 'profile',
  onSectionChange 
}: AccountNavigationProps) {
  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <nav className="space-y-2">
      {sections.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange?.(section.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="font-medium">{section.label}</span>
          </button>
        )
      })}
    </nav>
  )
} 
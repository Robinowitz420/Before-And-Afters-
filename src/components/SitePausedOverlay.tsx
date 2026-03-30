'use client'

import { Button } from '@/components/ui/button'

interface SitePausedOverlayProps {
  message?: string
}

export function SitePausedOverlay({ 
  message = "Site paused till further notice, Michelle needs to reply to Robin!" 
}: SitePausedOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Grayed out background overlay */}
      <div className="absolute inset-0 bg-gray-500/80 backdrop-blur-sm" />
      
      {/* Modal popup */}
      <div className="relative z-10 max-w-md mx-4 p-8 bg-white rounded-3xl shadow-2xl border-4 border-pink-300 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-pink-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Temporarily Paused
        </h1>
        
        <p className="text-lg text-gray-600 leading-relaxed">
          {message}
        </p>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Please check back soon
          </p>
        </div>
      </div>
    </div>
  )
}

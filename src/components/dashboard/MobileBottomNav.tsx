'use client'

import { ZendeskButton } from './ZendeskButton'

export function MobileBottomNav() {
  return (
    <>
      {/* Zendesk Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ZendeskButton variant="icon" showBadge={true} />
      </div>
      
      {/* Safe area padding for devices with notches/home indicators */}
      <div className="h-safe-area-inset-bottom" />
    </>
  )
}

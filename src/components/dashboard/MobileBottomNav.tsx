'use client'

import { ZendeskButton } from './ZendeskButton'

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ZendeskButton variant="icon" showBadge={true} />
    </div>
  )
}

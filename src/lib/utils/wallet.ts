// src/lib/utils/wallet.ts

// Convert kobo to NGN display
export function formatNaira(kobo: number): string {
  const naira = kobo / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(naira)
}

// Convert NGN to kobo (for input)
export function parseNaira(naira: string): number {
  const num = parseFloat(naira.replace(/[^0-9.]/g, ''))
  return Math.round(num * 100)
}

// Format account number for display (no spaces)
export function formatAccountNumber(accountNumber: string): string {
  return accountNumber
}

// Generate display initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

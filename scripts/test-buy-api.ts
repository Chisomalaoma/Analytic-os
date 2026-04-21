// Test script to verify buy API fee calculation
// This simulates what should happen when buying ₦5,100 worth of tokens

const TRANSACTION_FEE_RATE = 0.0035 // 0.35%
const nairaAmount = 5100
const TOKEN_PRICE_NAIRA = 5100

console.log('=== BUY API FEE CALCULATION TEST ===\n')

console.log(`Input Amount: ₦${nairaAmount}`)

// Calculate transaction fee (0.35%)
const transactionFee = nairaAmount * TRANSACTION_FEE_RATE
const amountAfterFee = nairaAmount - transactionFee

console.log(`Transaction Fee (0.35%): ₦${transactionFee.toFixed(2)}`)
console.log(`Amount After Fee: ₦${amountAfterFee.toFixed(2)}`)

// Calculate tokens received based on amount AFTER fee deduction
const tokensReceived = amountAfterFee / TOKEN_PRICE_NAIRA

console.log(`Tokens Received: ${tokensReceived.toFixed(6)}`)
console.log(`Expected Token Value: ₦${(tokensReceived * TOKEN_PRICE_NAIRA).toFixed(2)}`)

console.log('\n=== EXPECTED RESULTS ===')
console.log(`User pays: ₦${nairaAmount}`)
console.log(`Fee deducted: ₦${transactionFee.toFixed(2)}`)
console.log(`Token value: ₦${amountAfterFee.toFixed(2)}`)
console.log(`Tokens received: ${tokensReceived.toFixed(6)}`)

// Monthly yield calculation
const monthlyYield = (amountAfterFee * 0.18) / 12
console.log(`Monthly yield (18% APY): ₦${monthlyYield.toFixed(2)}`)
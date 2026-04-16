import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding new tokens...')

  // Token 1: ENV - Enviable Investment Management Limited
  const env = await prisma.token.upsert({
    where: { symbol: 'ENV' },
    update: {
      name: 'Enviable Investment Management Limited',
      price: 400000, // N4,000 in kobo
      annualYield: 20.00,
      industry: 'Logistics',
      payoutFrequency: 'Monthly',
      investmentType: 'Fixed income',
      riskLevel: 'Medium',
      listingDate: new Date(),
      minimumInvestment: 100000, // N1,000 minimum
      employeeCount: 50,
      description: 'Enviable Investment Management Limited is a leading logistics company offering fixed income investment opportunities with monthly payouts.',
      isActive: true,
      priceChange24h: 0,
      volume: 0,
      transactionCount: 0,
    },
    create: {
      tokenId: 'ENV-001',
      symbol: 'ENV',
      name: 'Enviable Investment Management Limited',
      price: 400000, // N4,000 in kobo
      annualYield: 20.00,
      industry: 'Logistics',
      payoutFrequency: 'Monthly',
      investmentType: 'Fixed income',
      riskLevel: 'Medium',
      listingDate: new Date(),
      minimumInvestment: 100000, // N1,000 minimum
      employeeCount: 50,
      description: 'Enviable Investment Management Limited is a leading logistics company offering fixed income investment opportunities with monthly payouts.',
      isActive: true,
      priceChange24h: 0,
      volume: 0,
      transactionCount: 0,
    },
  })

  console.log('✅ Created/Updated ENV token:', env)

  // Token 2: RSVT - Risevest Technologies Global Limited
  const rsvt = await prisma.token.upsert({
    where: { symbol: 'RSVT' },
    update: {
      name: 'Risevest Technologies Global Limited',
      price: 510000, // N5,100 in kobo
      annualYield: 18.00,
      industry: 'Fintech',
      payoutFrequency: 'Monthly',
      investmentType: 'Fixed income',
      riskLevel: 'Medium',
      listingDate: new Date(),
      minimumInvestment: 100000, // N1,000 minimum
      employeeCount: 100,
      description: 'Risevest Technologies Global Limited is a fintech company providing innovative investment solutions with consistent monthly returns.',
      isActive: true,
      priceChange24h: 0,
      volume: 0,
      transactionCount: 0,
    },
    create: {
      tokenId: 'RSVT-001',
      symbol: 'RSVT',
      name: 'Risevest Technologies Global Limited',
      price: 510000, // N5,100 in kobo
      annualYield: 18.00,
      industry: 'Fintech',
      payoutFrequency: 'Monthly',
      investmentType: 'Fixed income',
      riskLevel: 'Medium',
      listingDate: new Date(),
      minimumInvestment: 100000, // N1,000 minimum
      employeeCount: 100,
      description: 'Risevest Technologies Global Limited is a fintech company providing innovative investment solutions with consistent monthly returns.',
      isActive: true,
      priceChange24h: 0,
      volume: 0,
      transactionCount: 0,
    },
  })

  console.log('✅ Created/Updated RSVT token:', rsvt)

  console.log('\n✅ All tokens added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

"use client";

import React from 'react';
import { ArrowLeft, FileText, AlertCircle, Shield, TrendingUp, DollarSign, Users, Scale, XCircle, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfUsePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-[#262626] bg-[#0A0A0A] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4459FF]/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#4459FF]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Terms of Use</h1>
                <p className="text-gray-400 text-sm">Effective Date: February 23, 2026 | Governing Law: Federal Republic of Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-invert max-w-none">
          {/* Introduction */}
          <div className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#4459FF]" />
              <h2 className="text-xl font-semibold text-white m-0">Introduction</h2>
            </div>
            <p className="text-gray-300 m-0 mb-4">
              These Terms of Use ("Terms") govern access to and use of the WTX website, mobile application, 
              and related services (collectively, the "Platform").
            </p>
            <p className="text-gray-300 m-0 mb-4">
              The Platform enables eligible investors to purchase, hold, sell, and redeem tokenized 
              fixed-income investment instruments that provide fixed annual yields with monthly distributions.
            </p>
            <p className="text-gray-300 m-0">
              By creating an account or using the Platform, you agree to be bound by these Terms.
            </p>
          </div>

          <div className="space-y-8">
            {/* Regulatory Status */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#4459FF]" />
                2. Regulatory Status
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>2.1</strong> The Platform operates in compliance with applicable Nigerian capital market regulations.
                </p>
                <p>
                  <strong>2.2</strong> Investment products made available on the Platform are issued, structured, 
                  or managed by licensed capital market operators where required.
                </p>
                <p>
                  <strong>2.3</strong> The Platform is not a bank and does not accept deposits. Funds invested 
                  are not bank deposits and are not insured by any deposit insurance scheme unless expressly stated.
                </p>
              </div>
            </section>

            {/* Eligibility */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4459FF]" />
                3. Eligibility
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>To fully access and use the Platform, you must:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Be at least 18 years old</li>
                  <li>Have full legal capacity</li>
                  <li>Complete KYC/AML verification</li>
                  <li>Provide accurate and complete information</li>
                  <li>Not be subject to sanctions or regulatory prohibitions</li>
                </ul>
                <p className="mt-4">
                  The Company reserves the right to suspend or terminate accounts at its discretion.
                </p>
              </div>
            </section>

            {/* Nature of Investment Products */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4459FF]" />
                4. Nature of Investment Products
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>4.1</strong> The Platform provides access to multiple fixed-income assets ("Investment Tokens").
                </p>
                <p>
                  <strong>4.2</strong> Each Investment Token represents a beneficial economic interest in an 
                  underlying fixed-income asset.
                </p>
                <p>
                  <strong>4.3</strong> Detailed asset information, including fixed income rate, tenure, risk profile, 
                  and issuer profile and details, will be disclosed before purchase.
                </p>
              </div>
            </section>

            {/* Fixed Annual Yield & Monthly Payouts */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#4459FF]" />
                5. Fixed Annual Yield & Monthly Payouts
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>5.1</strong> Each Investment Token carries a stated fixed annual yield ("Fixed Income Rate").
                </p>
                <p>
                  <strong>5.2</strong> Yield accrues daily and is paid monthly into the investor's platform wallet.
                </p>
                <p>
                  <strong>5.3</strong> Monthly payouts are derived from contractual obligations of the underlying 
                  issuer or structured instrument.
                </p>
                <p>
                  <strong>5.4</strong> Where an instrument is described as "guaranteed," such guarantee:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Is subject to the contractual structure disclosed in the offering documents</li>
                  <li>May rely on reserve funds, collateral, insurance arrangements, or third-party backing</li>
                  <li>Does not eliminate credit, systemic, or force majeure risk</li>
                </ul>
                <p>
                  <strong>5.5</strong> Returns are subject to the performance and solvency of the underlying issuer.
                </p>
              </div>
            </section>

            {/* Secondary Market & Token Sale */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">6. Secondary Market & Token Sale</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>6.1</strong> Investors may sell Investment Tokens at any time through:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>An internal marketplace; or</li>
                  <li>A liquidity facility provided by the Platform (if applicable)</li>
                </ul>
                <p>
                  <strong>6.2</strong> Liquidity depends on market demand and availability of buyers unless a 
                  dedicated liquidity reserve is disclosed.
                </p>
                <p>
                  <strong>6.3</strong> Sale price may be:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>At par value</li>
                  <li>At accrued value; or</li>
                  <li>Market-determined based on supply and demand</li>
                </ul>
                <p>
                  <strong>6.4</strong> The Platform does not guarantee instant liquidity unless expressly stated.
                </p>
              </div>
            </section>

            {/* Withdrawals */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">7. Withdrawals</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>7.1</strong> Investors may withdraw:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Monthly yield payouts</li>
                  <li>Proceeds from token sales</li>
                  <li>Matured principal</li>
                </ul>
                <p>
                  <strong>7.2</strong> Withdrawal requests are subject to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Compliance checks</li>
                  <li>Fraud monitoring</li>
                  <li>Applicable processing timelines</li>
                </ul>
                <p>
                  <strong>7.3</strong> The Platform may delay withdrawals where required by law, regulatory inquiry, 
                  or security concerns.
                </p>
              </div>
            </section>

            {/* Fees */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">8. Fees</h2>
              <div className="space-y-4 text-gray-300">
                <p>The Platform may charge:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Brokerage and trade fees</li>
                  <li>Early exit/redemption fees</li>
                  <li>Withdrawal fees</li>
                </ul>
                <p className="mt-4">
                  All fees will be disclosed before transaction confirmation.
                </p>
              </div>
            </section>

            {/* Risk Disclosure */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                9. Risk Disclosure
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>Investments in fixed-income instruments involve risks, including but not limited to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Issuer default risk</li>
                  <li>Liquidity risk</li>
                  <li>Interest rate risk</li>
                  <li>Regulatory risk</li>
                  <li>Operational risk</li>
                </ul>
                <p className="mt-4 text-yellow-400 font-semibold">
                  Capital is not guaranteed except as expressly provided in specific offering documentation.
                </p>
                <p className="mt-2">
                  Investors should only invest funds they can afford to commit for the investment duration.
                </p>
              </div>
            </section>

            {/* User Obligations */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">10. User Obligations</h2>
              <div className="space-y-4 text-gray-300">
                <p>Users agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide accurate information</li>
                  <li>Maintain confidentiality of login credentials</li>
                  <li>Not engage in fraudulent or manipulative activities</li>
                  <li>Comply with Nigerian laws and regulations</li>
                </ul>
                <p className="mt-4">Two-factor authentication may be required.</p>
              </div>
            </section>

            {/* AML / CFT Compliance */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#4459FF]" />
                11. AML / CFT Compliance
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  The Platform complies with Nigerian anti-money laundering and counter-terrorism financing laws.
                </p>
                <p className="mt-4">The Company may:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Request additional documentation</li>
                  <li>Freeze accounts</li>
                  <li>Report suspicious transactions to regulators</li>
                </ul>
              </div>
            </section>

            {/* Taxation */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">12. Taxation</h2>
              <div className="space-y-4 text-gray-300">
                <p>Investors are responsible for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Personal or corporate tax obligations</li>
                  <li>Reporting investment income</li>
                  <li>Withholding tax compliance where applicable</li>
                </ul>
                <p className="mt-4">
                  The Platform may deduct statutory withholding taxes where required by law.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                13. Limitation of Liability
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>To the maximum extent permitted by Nigerian law:</p>
                <p className="mt-4">The Company shall not be liable for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Losses due to issuer insolvency</li>
                  <li>Market fluctuations</li>
                  <li>Regulatory actions</li>
                  <li>Indirect or consequential damages</li>
                </ul>
                <p className="mt-4 font-semibold text-white">
                  Liability is limited to fees paid to the Platform within the preceding 12 months.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">14. Termination</h2>
              <div className="space-y-4 text-gray-300">
                <p>The Company may suspend or terminate accounts for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Breach of these Terms</li>
                  <li>Fraudulent activity</li>
                  <li>Regulatory requirements</li>
                </ul>
                <p className="mt-4">
                  Upon termination, users may withdraw available balances subject to compliance review.
                </p>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#4459FF]" />
                15. Dispute Resolution
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Any dispute arising under these Terms shall be resolved by arbitration in Lagos, Nigeria, 
                  in accordance with applicable arbitration laws.
                </p>
              </div>
            </section>

            {/* Amendments */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">16. Amendments</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  The Company may amend these Terms at any time. Continued use of the Platform constitutes 
                  acceptance of updated Terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#4459FF]" />
                17. Contact Information
              </h2>
              <div className="space-y-4 text-gray-300">
                <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4">
                  <p className="font-semibold text-white mb-3">WTX</p>
                  <ul className="space-y-2">
                    <li><strong>RC Number:</strong> [To be provided]</li>
                    <li><strong>Location:</strong> Lagos, Nigeria</li>
                    <li><strong>Email:</strong> <a href="mailto:Support@wtxonline.com" className="text-[#4459FF] hover:underline">Support@wtxonline.com</a></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

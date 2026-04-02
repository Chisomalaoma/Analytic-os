"use client";

import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, FileText, Database, Users, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
                <Eye className="w-5 h-5 text-[#4459FF]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
                <p className="text-gray-400 text-sm">Effective Date: February 23, 2026 | Last Updated: February 23, 2026</p>
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
              <Shield className="w-6 h-6 text-[#4459FF]" />
              <h2 className="text-xl font-semibold text-white m-0">Introduction</h2>
            </div>
            <p className="text-gray-300 m-0">
              XTes Limited ("Company", "we", "our", or "us") is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, process, store, disclose, and protect personal 
              data when you use our website, mobile application, and related investment services (the "Platform").
            </p>
            <p className="text-gray-300 mt-4 m-0">
              By using the Platform, you consent to the practices described in this Privacy Policy.
            </p>
          </div>

          <div className="space-y-8">
            {/* Legal Basis */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4459FF]" />
                Legal Basis for Processing
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>We process personal data in accordance with:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Nigeria Data Protection Act (NDPA) 2023</li>
                  <li>Applicable anti-money laundering laws</li>
                  <li>Securities and capital market regulations</li>
                  <li>Contractual obligations</li>
                </ul>
                <p className="mt-4">Our lawful bases for processing include:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Performance of a contract</li>
                  <li>Legal obligation</li>
                  <li>Legitimate interest</li>
                  <li>Consent (where applicable)</li>
                </ul>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#4459FF]" />
                Information We Collect
              </h2>
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-white font-semibold mb-3">3.1 Personal Identification Information</h3>
                  <p className="mb-2">We may collect:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Full name</li>
                    <li>Date of birth</li>
                    <li>Gender</li>
                    <li>Nationality</li>
                    <li>Residential address</li>
                    <li>Phone number</li>
                    <li>Email address</li>
                    <li>Government-issued identification (NIN, Passport, Driver's License, voters card)</li>
                    <li>Photograph/selfie verification</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-3">3.2 Financial Information</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Bank account details</li>
                    <li>Transaction history</li>
                    <li>Investment portfolio data</li>
                    <li>Wallet balances</li>
                    <li>Withdrawal details</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">3.3 Technical Information</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP address</li>
                    <li>Device type</li>
                    <li>Operating system</li>
                    <li>Browser type</li>
                    <li>Login timestamps</li>
                    <li>Cookies and usage analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">3.4 Investment Data</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Fixed income asset purchases</li>
                    <li>Token holdings</li>
                    <li>Monthly payout records</li>
                    <li>Secondary market transactions</li>
                    <li>Redemption history</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-gray-300">
                <p>We use personal data to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Create and manage your account</li>
                  <li>Verify your identity (KYC)</li>
                  <li>Comply with AML/CFT obligations</li>
                  <li>Process investments and token purchases</li>
                  <li>Distribute monthly yield payouts</li>
                  <li>Facilitate secondary sales and withdrawals</li>
                  <li>Detect fraud and suspicious activity</li>
                  <li>Improve platform functionality</li>
                  <li>Provide customer support</li>
                  <li>Comply with regulatory reporting requirements</li>
                </ul>
              </div>
            </section>

            {/* Disclosure of Information */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4459FF]" />
                Disclosure of Information
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>We may share your information with:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Licensed asset managers</li>
                  <li>Custodian banks</li>
                  <li>Payment processors</li>
                  <li>Identity verification providers</li>
                  <li>Legal and compliance advisors</li>
                  <li>Government or regulatory authorities where required by law</li>
                  <li>Law enforcement agencies under lawful request</li>
                </ul>
                <p className="mt-4 font-semibold text-white">We do not sell personal data.</p>
              </div>
            </section>

            {/* Data Retention */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
              <div className="space-y-4 text-gray-300">
                <p>We retain personal data:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>For as long as your account remains active</li>
                  <li>For statutory record-keeping periods required under Nigerian law</li>
                  <li>For regulatory and audit purposes</li>
                  <li>As required under AML/CFT regulations</li>
                </ul>
                <p className="mt-4">
                  After retention periods expire, data will be securely deleted or anonymized.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#4459FF]" />
                Data Security
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  We implement technical and organizational measures to protect personal data, including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Data encryption</li>
                  <li>Secure servers</li>
                  <li>Role-based access controls</li>
                  <li>Two-factor authentication</li>
                  <li>Regular security audits</li>
                </ul>
                <p className="mt-4 text-yellow-400">
                  However, no system is completely secure. Users are responsible for safeguarding login credentials.
                </p>
              </div>
            </section>

            {/* Your Rights Under NDPA */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your Rights Under NDPA</h2>
              <div className="space-y-4 text-gray-300">
                <p>Under the Nigeria Data Protection Act, you have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion (subject to legal retention requirements)</li>
                  <li>Object to certain processing</li>
                  <li>Withdraw consent (where processing is based on consent)</li>
                  <li>Lodge a complaint with the Nigeria Data Protection Commission</li>
                </ul>
                <p className="mt-4">
                  Requests may be made via <span className="text-[#4459FF]">support@xtes.app</span>
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-300">
                <p>We use cookies to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Authenticate users</li>
                  <li>Improve performance</li>
                  <li>Analyze platform usage</li>
                  <li>Enhance security</li>
                </ul>
                <p className="mt-4">
                  You may disable cookies in your browser settings, but certain features may not function properly.
                </p>
              </div>
            </section>

            {/* Cross-Border Data Transfers */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#4459FF]" />
                Cross-Border Data Transfers
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>If data is transferred outside Nigeria:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Transfers will comply with NDPA requirements</li>
                  <li>Adequate safeguards will be implemented</li>
                  <li>Data protection agreements will be executed where required</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Links */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Third-Party Links</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  The Platform may contain links to third-party websites. We are not responsible for 
                  the privacy practices of those sites.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Children's Privacy</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  The Platform is not intended for individuals under 18 years of age. We do not 
                  knowingly collect data from minors.
                </p>
              </div>
            </section>

            {/* Automated Decision-Making */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Automated Decision-Making</h2>
              <div className="space-y-4 text-gray-300">
                <p>We may use automated systems for:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Fraud detection</li>
                  <li>Risk scoring</li>
                  <li>Transaction monitoring</li>
                </ul>
                <p className="mt-4">These systems assist compliance and security processes.</p>
              </div>
            </section>

            {/* Changes to This Policy */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  We may update this Privacy Policy periodically. Continued use of the Platform 
                  constitutes acceptance of any updates.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-300">
                <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4">
                  <p className="font-semibold text-white mb-3">XTES LIMITED</p>
                  <ul className="space-y-2">
                    <li><strong>RC Number:</strong> 9444998</li>
                    <li><strong>Location:</strong> Lagos, Nigeria</li>
                    <li><strong>Email:</strong> <a href="mailto:support@xtes.app" className="text-[#4459FF] hover:underline">support@xtes.app</a></li>
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

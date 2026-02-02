"use client";

import React from 'react';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
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
                <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-invert max-w-none">
          <div className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#4459FF]" />
              <h2 className="text-xl font-semibold text-white m-0">Agreement to Terms</h2>
            </div>
            <p className="text-gray-300 m-0">
              By accessing and using this financial technology platform, you accept and agree to be 
              bound by the terms and provisions of this agreement. Please read these terms carefully 
              before using our services.
            </p>
          </div>

          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  By creating an account or using our platform, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Use and our Privacy Policy.
                </p>
                <p>
                  If you do not agree to these terms, you must not access or use our services.
                </p>
              </div>
            </section>

            {/* Eligibility */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">2. Eligibility</h2>
              <div className="space-y-4 text-gray-300">
                <p>To use our platform, you must:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be prohibited from using our services under applicable laws</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                </ul>
              </div>
            </section>

            {/* Account Registration */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration and Security</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-white font-medium mb-2">Account Creation</h3>
                  <p>
                    You agree to provide accurate, current, and complete information during registration 
                    and to update such information to keep it accurate, current, and complete.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Account Security</h3>
                  <p>You are responsible for:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                    <li>Ensuring your account information remains current</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Financial Services */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">4. Financial Services and Transactions</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-white font-medium mb-2">Investment Risks</h3>
                  <p>
                    You acknowledge that all investments carry risk, including the potential loss of 
                    principal. Past performance does not guarantee future results.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Transaction Processing</h3>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>All transactions are subject to verification and approval</li>
                    <li>We reserve the right to refuse or cancel any transaction</li>
                    <li>Transaction fees may apply as disclosed on our platform</li>
                    <li>Processing times may vary based on payment method and verification requirements</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Wallet Services</h3>
                  <p>
                    Our wallet services allow you to store, send, and receive funds. You are responsible 
                    for maintaining sufficient funds for transactions and understanding applicable fees.
                  </p>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                5. Prohibited Activities
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Use our services for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any malicious code or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Engage in fraudulent activities or money laundering</li>
                  <li>Manipulate market prices or engage in market abuse</li>
                  <li>Create multiple accounts to circumvent restrictions</li>
                  <li>Use automated systems to access our platform without permission</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property Rights</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  All content, features, and functionality on our platform, including but not limited to 
                  text, graphics, logos, icons, images, and software, are the exclusive property of our 
                  company or our licensors and are protected by copyright, trademark, and other intellectual 
                  property laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, create derivative works of, publicly display, 
                  or exploit any of our content without our express written permission.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">7. Disclaimers and Limitations of Liability</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-white font-medium mb-2">Service Availability</h3>
                  <p>
                    Our services are provided "as is" and "as available" without warranties of any kind. 
                    We do not guarantee uninterrupted, secure, or error-free service.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-2">Investment Advice</h3>
                  <p>
                    We do not provide investment, legal, or tax advice. Any information provided on our 
                    platform is for informational purposes only and should not be construed as professional advice.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Limitation of Liability</h3>
                  <p>
                    To the maximum extent permitted by law, we shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages, including loss of profits, 
                    data, or other intangible losses.
                  </p>
                </div>
              </div>
            </section>

            {/* Indemnification */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">8. Indemnification</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  You agree to indemnify, defend, and hold harmless our company, its officers, directors, 
                  employees, and agents from any claims, liabilities, damages, losses, and expenses arising 
                  from:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Your use of our services</li>
                  <li>Your violation of these Terms of Use</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your violation of any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">9. Termination</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  We reserve the right to suspend or terminate your account and access to our services 
                  at any time, with or without notice, for any reason, including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Violation of these Terms of Use</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Extended period of inactivity</li>
                  <li>Request by law enforcement or regulatory authorities</li>
                </ul>
                <p>
                  Upon termination, your right to use our services will immediately cease. We will make 
                  reasonable efforts to return any remaining funds in your account, subject to applicable 
                  laws and regulations.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">10. Governing Law and Dispute Resolution</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  These Terms of Use shall be governed by and construed in accordance with the laws of 
                  [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these terms or your use of our services shall be resolved 
                  through binding arbitration in accordance with the rules of [Arbitration Body], except 
                  where prohibited by law.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  We reserve the right to modify these Terms of Use at any time. When we make changes, we will:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Update the "Last updated" date at the top of this page</li>
                  <li>Notify you via email or platform notification for material changes</li>
                  <li>Provide a reasonable period for you to review the changes</li>
                </ul>
                <p>
                  Your continued use of our services after changes take effect constitutes acceptance of 
                  the revised terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-[#1A1A1A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#4459FF]" />
                12. Contact Information
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  If you have any questions about these Terms of Use, please contact us:
                </p>
                <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-4">
                  <ul className="space-y-2">
                    <li><strong>Email:</strong> legal@yourplatform.com</li>
                    <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                    <li><strong>Address:</strong> 123 Financial District, Suite 100, City, State 12345</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Severability */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">13. Severability</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  If any provision of these Terms of Use is found to be unenforceable or invalid, that 
                  provision will be limited or eliminated to the minimum extent necessary so that these 
                  Terms of Use will otherwise remain in full force and effect.
                </p>
              </div>
            </section>

            {/* Entire Agreement */}
            <section className="bg-[#0A0A0A] border border-[#262626] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">14. Entire Agreement</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  These Terms of Use, together with our Privacy Policy and any other legal notices 
                  published by us on our platform, constitute the entire agreement between you and us 
                  concerning your use of our services.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { ExternalLink, FileText, Shield, Eye } from 'lucide-react';

interface ComplianceSectionProps {
  className?: string;
}

const ComplianceSection: React.FC<ComplianceSectionProps> = ({ className = '' }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handlePrivacyClick = () => {
    setShowPrivacyModal(true);
  };

  const handleTermsClick = () => {
    setShowTermsModal(true);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className={`bg-[#0A0A0A] border border-[#262626] rounded-lg p-4 sm:p-6 ${className}`}>
        <div className="mb-4 sm:mb-6">
          <div className="font-semibold text-white flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-5 h-5 text-[#4459FF]" />
            Legal & Compliance
          </div>
          <div className="text-gray-400 text-xs sm:text-sm mt-1">
            Access important legal documents and privacy information
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Privacy Policy */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-[#1A1A1A] border border-[#23262F] rounded-lg hover:border-[#4459FF]/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#4459FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-[#4459FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm sm:text-base">Privacy Policy</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Learn how we collect, use, and protect your personal information
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-13 sm:ml-0">
              <button
                onClick={handlePrivacyClick}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#23262F] hover:bg-[#2A2D37] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                View
              </button>
              <button
                onClick={() => handleExternalLink('/privacy-policy')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Open
              </button>
            </div>
          </div>

          {/* Terms of Use */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-[#1A1A1A] border border-[#23262F] rounded-lg hover:border-[#4459FF]/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#4459FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#4459FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm sm:text-base">Terms of Use</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Understand your rights and responsibilities when using our platform
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-13 sm:ml-0">
              <button
                onClick={handleTermsClick}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#23262F] hover:bg-[#2A2D37] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                View
              </button>
              <button
                onClick={() => handleExternalLink('/terms-of-use')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Open
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#1A1A1A] border border-[#23262F] rounded-lg">
            <div className="text-xs sm:text-sm text-gray-400">
              <div className="font-medium text-gray-300 mb-2">Document Information</div>
              <div className="space-y-1">
                <div>• Documents are updated regularly to reflect current policies</div>
                <div>• Last updated: {new Date().toLocaleDateString()}</div>
                <div>• For questions about these documents, contact our support team</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#4459FF]" />
                Privacy Policy
              </h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 space-y-4">
                  <p>
                    This Privacy Policy describes how we collect, use, and protect your personal information 
                    when you use our financial technology platform.
                  </p>
                  
                  <h3 className="text-white font-semibold">Information We Collect</h3>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    make transactions, or contact us for support. This may include your name, email address, 
                    phone number, and financial information.
                  </p>
                  
                  <h3 className="text-white font-semibold">How We Use Your Information</h3>
                  <p>
                    We use the information we collect to provide, maintain, and improve our services, 
                    process transactions, send you technical notices and support messages, and comply 
                    with legal obligations.
                  </p>
                  
                  <h3 className="text-white font-semibold">Information Sharing</h3>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except as described in this policy or as required by law.
                  </p>
                  
                  <h3 className="text-white font-semibold">Data Security</h3>
                  <p>
                    We implement appropriate security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  
                  <h3 className="text-white font-semibold">Contact Us</h3>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us through our 
                    support channels.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#262626] flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-[#262626] rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#262626]">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4459FF]" />
                Terms of Use
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 space-y-4">
                  <p>
                    These Terms of Use govern your access to and use of our financial technology platform 
                    and services.
                  </p>
                  
                  <h3 className="text-white font-semibold">Acceptance of Terms</h3>
                  <p>
                    By accessing or using our services, you agree to be bound by these Terms of Use and 
                    all applicable laws and regulations.
                  </p>
                  
                  <h3 className="text-white font-semibold">User Responsibilities</h3>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials 
                    and for all activities that occur under your account.
                  </p>
                  
                  <h3 className="text-white font-semibold">Prohibited Uses</h3>
                  <p>
                    You may not use our services for any unlawful purpose or in any way that could damage, 
                    disable, overburden, or impair our services.
                  </p>
                  
                  <h3 className="text-white font-semibold">Financial Services</h3>
                  <p>
                    Our platform provides access to financial services and investment opportunities. 
                    All investments carry risk, and past performance does not guarantee future results.
                  </p>
                  
                  <h3 className="text-white font-semibold">Limitation of Liability</h3>
                  <p>
                    We shall not be liable for any indirect, incidental, special, consequential, or 
                    punitive damages arising from your use of our services.
                  </p>
                  
                  <h3 className="text-white font-semibold">Changes to Terms</h3>
                  <p>
                    We reserve the right to modify these terms at any time. Continued use of our services 
                    constitutes acceptance of any changes.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#262626] flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComplianceSection;
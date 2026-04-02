"use client";

import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Wallet,
  DollarSign,
  Clock,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { HeroBackground } from "./AnimatedSVG";
import { FeatureCard, GlassCard, GlowingCard, StatCard } from "./GlassCard";

interface HeroSectionProps {
  onOpenSignUp?: () => void;
  onOpenSignIn?: () => void;
}

export function HeroSection({ onOpenSignUp, onOpenSignIn }: HeroSectionProps) {
  const [selectedToken, setSelectedToken] = useState("opay");
  const [investmentAmount, setInvestmentAmount] = useState(1000000);

  const tokens = [
    {
      id: "opay",
      name: "Opay Digital Services",
      yield: 15,
      industry: "Fintech",
      monthlyPayout: true,
    },
    {
      id: "fcmb",
      name: "First City Monument Bank",
      yield: 18,
      industry: "Banking",
      monthlyPayout: true,
    },
    {
      id: "abmfb",
      name: "AB Microfinance Bank",
      yield: 19,
      industry: "Banking",
      monthlyPayout: true,
    },
  ];

  const selectedTokenData = tokens.find((t) => t.id === selectedToken) || tokens[0];
  const monthlyYield = (investmentAmount * selectedTokenData.yield) / 100 / 12;
  const totalEarning = investmentAmount + (investmentAmount * selectedTokenData.yield) / 100;

  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: "Earn up to 30% annual yields",
      description: "Get competitive returns on your investments with transparent, fixed-income opportunities.",
    },
    {
      icon: <Clock size={24} />,
      title: "Monthly payouts",
      description: "Receive consistent income every month directly into your wallet.",
    },
    {
      icon: <Shield size={24} />,
      title: "Backed by real world assets",
      description: "Your investments are secured by tangible assets from established companies.",
    },
    {
      icon: <Building2 size={24} />,
      title: "Multiple investment options",
      description: "Choose from various opportunities with just one account.",
    },
    {
      icon: <Wallet size={24} />,
      title: "Withdraw anytime",
      description: "Access your funds when you need them with flexible withdrawal options.",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Better rates from top companies",
      description: "Get exclusive access to premium investment opportunities.",
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Background Animations */}
      <HeroBackground />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4459FF] to-[#7C3AED] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">XTes</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={onOpenSignIn}
            className="px-5 py-2 text-gray-300 hover:text-white transition-colors font-medium"
          >
            Sign In
          </button>
          <button
            onClick={onOpenSignUp}
            className="px-5 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#4459FF]/25"
          >
            Start Earning Today
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-12 pt-16 pb-32">
        {/* Badge */}
        <div className="animate-fadeInUp mb-8">
          <GlassCard padding="sm" hover={false}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
              </span>
              <span className="text-sm text-gray-300">Invest with XTes</span>
            </div>
          </GlassCard>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fadeInUp stagger-1 text-center max-w-4xl mx-auto">
          <span className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Earn up to 30%
            <br />
            <span className="bg-gradient-to-r from-[#4459FF] via-[#7C3AED] to-[#4459FF] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Monthly Income
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="animate-fadeInUp stagger-2 text-center max-w-2xl mx-auto mt-6 text-gray-400 text-lg md:text-xl leading-relaxed">
          Invest in fixed income-generating opportunities and get paid every month — transparently, securely, and on your terms.
        </p>

        {/* Feature Pills */}
        <div className="animate-fadeInUp stagger-3 flex flex-wrap justify-center gap-3 mt-8 max-w-4xl">
          {[
            "Earn up to 30% annual yields",
            "Monthly payouts",
            "Backed by real world assets",
            "Multiple investment options",
            "Withdraw anytime",
            "Better rates from top companies",
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#252525] rounded-full"
            >
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="animate-fadeInUp stagger-4 mt-10">
          <button
            onClick={onOpenSignUp}
            className="group relative px-10 py-5 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-xl text-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#4459FF]/25 hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              Start Earning Today
              <ArrowRight
                size={24}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-transparent to-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start earning predictable income in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Deposit",
                desc: "Create an account and fund your XTes account",
                icon: <Wallet size={32} />,
              },
              {
                step: "02",
                title: "Invest",
                desc: "Browse vetted investment options with clear pricing, yield, and payout schedules",
                icon: <TrendingUp size={32} />,
              },
              {
                step: "03",
                title: "Earn",
                desc: "Earn predictable income every month directly into your wallet",
                icon: <DollarSign size={32} />,
              },
              {
                step: "04",
                title: "Withdraw",
                desc: "Withdraw profits or compound earnings directly from your dashboard",
                icon: <ArrowRight size={32} />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="animate-fadeInUp relative"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <GlassCard padding="lg" className="h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#4459FF]/20 flex items-center justify-center mx-auto mb-4">
                    <div className="text-[#4459FF]">{item.icon}</div>
                  </div>
                  <span className="text-4xl font-bold text-[#4459FF]/30 mb-3 block">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Calculator Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Investment Calculator
            </h2>
            <p className="text-gray-400 text-lg">
              Explore available investments and calculate your potential earnings
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Token Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-6">
                Explore Available Investments
              </h3>
              {tokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => setSelectedToken(token.id)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedToken === token.id
                      ? "border-[#4459FF] bg-[#4459FF]/10"
                      : "border-[#252525] bg-[#1A1A1A] hover:border-[#353535]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {token.name}
                      </h4>
                      <p className="text-sm text-gray-400">Industry: {token.industry}</p>
                    </div>
                    {token.monthlyPayout && (
                      <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Annual Yield</p>
                      <p className="text-2xl font-bold text-[#4459FF]">{token.yield}%</p>
                    </div>
                    <div className="h-8 w-px bg-[#252525]" />
                    <div>
                      <p className="text-sm text-gray-400">Monthly Payout</p>
                      <p className="text-sm text-green-400 font-medium">30 days ✓</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Calculator */}
            <GlowingCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Investment Calculator
              </h3>

              {/* Selected Token Display */}
              <div className="mb-6 p-4 bg-[#1A1A1A] rounded-lg border border-[#252525]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Selected Investment</span>
                  <span className="text-sm font-medium text-[#4459FF]">
                    {selectedTokenData.yield}% APY
                  </span>
                </div>
                <p className="text-white font-semibold">{selectedTokenData.name}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedTokenData.industry}</p>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  How much do you want to invest?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full bg-[#1A1A1A] border border-[#252525] rounded-lg pl-8 pr-4 py-4 text-white text-lg focus:outline-none focus:border-[#4459FF] transition-colors"
                    placeholder="1,000,000"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#252525]">
                  <p className="text-sm text-gray-400 mb-1">Expected Yield Payout</p>
                  <p className="text-2xl font-bold text-green-400">
                    ₦{monthlyYield.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per month</p>
                </div>
                <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#252525]">
                  <p className="text-sm text-gray-400 mb-1">Total Earning</p>
                  <p className="text-2xl font-bold text-[#4459FF]">
                    ₦{totalEarning.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">after 1 year</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-6">
                * Total earning includes your principal investment
              </p>

              <button
                onClick={onOpenSignUp}
                className="w-full py-4 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#4459FF]/25"
              >
                Start Investing
              </button>
            </GlowingCard>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-gradient-to-b from-[#0A0A0A] to-[#0D0D0D]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <GlowingCard className="text-center py-16 px-8">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#4459FF]/20 flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={40} className="text-[#4459FF]" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Let your money work for you — Every Month
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Start earning consistent income from trusted real world assets today.
            </p>
            <button
              onClick={onOpenSignUp}
              className="group inline-flex items-center gap-2 px-10 py-5 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-xl text-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#4459FF]/25 hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight
                size={24}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </GlowingCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-[#23262F]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4459FF] to-[#7C3AED] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">XTes</span>
            </div>
          </div>
          <div className="pt-6 border-t border-[#23262F]">
            <p className="text-sm text-gray-500 text-center">
              <strong>Disclaimer:</strong> Returns are not guaranteed. Investment values may fluctuate. 
              Please read all risk disclosures before investing.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default HeroSection;

"use client";

import { useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Users,
  Building2,
  Search,
  CheckCircle,
  TrendingUp,
  Globe,
  Award,
  Target,
  Zap,
} from "lucide-react";

export default function WisperLandingPage() {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: <Search size={32} />,
      title: "Smart Job Matching",
      description:
        "Our AI-powered algorithm matches you with the perfect job opportunities based on your skills and preferences.",
    },
    {
      icon: <Users size={32} />,
      title: "Verified Employers",
      description:
        "Connect with trusted companies. All employers are verified to ensure legitimate job opportunities.",
    },
    {
      icon: <Zap size={32} />,
      title: "Quick Applications",
      description:
        "Apply to multiple jobs with one click. Your profile is your resume, making applications fast and easy.",
    },
    {
      icon: <Award size={32} />,
      title: "Career Growth",
      description:
        "Access career resources, skill assessments, and personalized recommendations to advance your career.",
    },
  ];

  const stats = [
    { value: "50,000+", label: "Active Jobs" },
    { value: "10,000+", label: "Companies" },
    { value: "100,000+", label: "Job Seekers" },
    { value: "95%", label: "Success Rate" },
  ];

  const jobCategories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Marketing",
    "Sales",
    "Engineering",
    "Education",
    "Design",
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className="border-b border-[#262626] bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4459FF] to-[#7C3AED] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Wisper<span className="text-[#4459FF]">Online</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a
                href="#jobs"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Find Jobs
              </a>
              <a
                href="#employers"
                className="text-gray-300 hover:text-white transition-colors"
              >
                For Employers
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
              <button className="px-5 py-2 text-gray-300 hover:text-white transition-colors">
                Sign In
              </button>
              <button className="px-5 py-2 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg transition-all duration-300">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4459FF]/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#262626] rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span className="text-sm text-gray-300">
                Nigeria's Leading Job Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Find Your Dream Job
              <br />
              <span className="bg-gradient-to-r from-[#4459FF] via-[#7C3AED] to-[#4459FF] bg-clip-text text-transparent">
                Start Your Career
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Connect with top employers across Nigeria. Discover thousands of
              job opportunities and take the next step in your career journey.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-[#1A1A1A] border border-[#262626] rounded-xl">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                  />
                </div>
                <button className="px-6 py-3 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2">
                  Search Jobs
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-400">Popular:</span>
              {jobCategories.slice(0, 5).map((category, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#262626] rounded-full text-sm text-gray-300 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-[#262626]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="jobs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose WisperOnline?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to find your perfect job and advance your
              career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-[#1A1A1A] border border-[#262626] rounded-xl hover:border-[#4459FF]/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-[#4459FF]/10 flex items-center justify-center mb-4">
                  <div className="text-[#4459FF]">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-transparent to-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Get hired in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Sign up and build your professional profile in minutes",
                icon: <Users size={32} />,
              },
              {
                step: "02",
                title: "Search & Apply",
                desc: "Browse thousands of jobs and apply with one click",
                icon: <Search size={32} />,
              },
              {
                step: "03",
                title: "Get Hired",
                desc: "Connect with employers and land your dream job",
                icon: <Target size={32} />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative p-8 bg-[#1A1A1A] border border-[#262626] rounded-xl text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#4459FF]/20 flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#4459FF]">{item.icon}</div>
                </div>
                <span className="text-5xl font-bold text-[#4459FF]/20 mb-4 block">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section className="py-20" id="employers">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Hire Top Talent Fast
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Post jobs, review candidates, and hire the best talent for your
                company. Our platform makes recruitment simple and effective.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Access to 100,000+ qualified candidates",
                  "Advanced filtering and search tools",
                  "Applicant tracking system",
                  "Dedicated account manager",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={14} className="text-green-400" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
              <button className="px-8 py-4 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                Post a Job
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="relative">
              <div className="p-8 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#262626] rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#4459FF]/20 flex items-center justify-center">
                    <Building2 size={24} className="text-[#4459FF]" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Company Dashboard
                    </div>
                    <div className="text-sm text-gray-400">
                      Manage your hiring
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Active Jobs
                      </span>
                      <span className="text-2xl font-bold text-white">24</span>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Applications
                      </span>
                      <span className="text-2xl font-bold text-[#4459FF]">
                        1,247
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Hired This Month
                      </span>
                      <span className="text-2xl font-bold text-green-400">
                        18
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-12 bg-gradient-to-br from-[#4459FF]/20 to-[#7C3AED]/20 border border-[#4459FF]/30 rounded-2xl text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#4459FF]/20 flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} className="text-[#4459FF]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who found their dream jobs through
              WisperOnline
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-[#4459FF] hover:bg-[#3448EE] text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                Create Free Account
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#252525] border border-[#262626] text-white rounded-xl font-semibold transition-all duration-300">
                Browse Jobs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#262626] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4459FF] to-[#7C3AED] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  WisperOnline
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Nigeria's leading job recruitment platform connecting talent
                with opportunity.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Browse Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Career Advice
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Resume Builder
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Salary Guide
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Post a Job
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Browse Candidates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Recruitment Solutions
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 WisperOnline. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import {
  Brain,
  Search,
  Share2,
  FileText,
  ImageIcon,
  FolderOpen,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Shield,
  PlayCircle,
  BarChart3,
  Clock,
  Lock,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@repo/ui/button";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Sortify
                </h1>
                <p className="text-xs text-gray-500 -mt-1">
                  AI-Powered File Intelligence
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Reviews
              </a>
              <a
                href="#docs"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Documentation
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt={session.user?.name || "User avatar"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border-2 border-blue-100"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                  </div>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => signIn()}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <Button
                    onClick={() => signIn()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Free
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center space-y-8">
            {/* Announcement Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm text-blue-700">
              <Star className="h-4 w-4" />
              <span className="font-medium">
                #1 AI-Powered File Management Platform
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 leading-tight tracking-tight">
              Your Files,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Supercharged
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Transform your file management with AI that understands content,
              predicts needs, and organizes everything automatically. Stop
              searching. Start finding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {session ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center space-x-2">
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => signIn()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 flex flex-col items-center space-y-4">
              <p className="text-sm text-gray-500 font-medium">
                Trusted by 10,000+ professionals worldwide
              </p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">4.9/5</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>10,000+ users</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>SOC 2 Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-white border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Intelligence Built-In
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed to make your files work smarter, not
              harder. Experience the future of file management today.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            <EnhancedFeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI Content Understanding"
              description="Advanced machine learning analyzes every file type - from PDFs to images - extracting meaning, context, and actionable insights automatically."
              gradient="from-blue-500 to-blue-600"
              features={[
                "PDF text extraction & summaries",
                "Image object recognition",
                "Document sentiment analysis",
                "Automatic metadata generation",
              ]}
            />

            <EnhancedFeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Semantic Search Engine"
              description="Search by meaning, not just keywords. Ask natural questions and get intelligent results that understand context and intent."
              gradient="from-green-500 to-green-600"
              features={[
                "Natural language queries",
                "Contextual search results",
                "Cross-file content correlation",
                "Smart filter suggestions",
              ]}
            />

            <EnhancedFeatureCard
              icon={<FolderOpen className="h-8 w-8" />}
              title="Auto-Organization"
              description="Files organize themselves using AI-driven categorization. No more manual sorting - just intelligent, automatic file management."
              gradient="from-purple-500 to-purple-600"
              features={[
                "Smart folder creation",
                "Content-based grouping",
                "Duplicate detection",
                "Project correlation",
              ]}
            />
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Share2 className="h-6 w-6 text-orange-500" />}
              title="Secure Sharing"
              description="Enterprise-grade sharing with expiring links, password protection, and detailed access controls."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-red-500" />}
              title="Instant Summaries"
              description="Get AI-generated summaries of documents, research papers, and reports in seconds."
            />
            <FeatureCard
              icon={<ImageIcon className="h-6 w-6 text-indigo-500" />}
              title="Visual Intelligence"
              description="Advanced image recognition that understands objects, text, scenes, and emotions."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-pink-500" />}
              title="Usage Analytics"
              description="Detailed insights into your file usage patterns and productivity metrics."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-teal-500" />}
              title="Version Control"
              description="Automatic versioning with intelligent diff detection and rollback capabilities."
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-gray-700" />}
              title="Enterprise Security"
              description="Bank-level encryption, SOC 2 compliance, and advanced threat protection."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Powering Productivity Worldwide
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of professionals who trust Sortify
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <EnhancedStatCard
              number="1M+"
              label="Files Processed"
              sublabel="Daily AI Analysis"
            />
            <EnhancedStatCard
              number="99.99%"
              label="Uptime"
              sublabel="Enterprise SLA"
            />
            <EnhancedStatCard
              number="500TB+"
              label="Data Managed"
              sublabel="Across All Users"
            />
            <EnhancedStatCard
              number="10K+"
              label="Active Users"
              sublabel="Growing Daily"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Loved by Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users say about transforming their workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Sortify has completely transformed how I manage my research files. The AI summaries save me hours every week."
              author="Dr. Sarah Chen"
              title="Research Scientist"
              company="Stanford University"
            />
            <TestimonialCard
              quote="As a creative director, finding the right assets quickly is crucial. Sortify's visual search is a game-changer."
              author="Marcus Rodriguez"
              title="Creative Director"
              company="Design Studio Pro"
            />
            <TestimonialCard
              quote="The automatic organization feature is like having a personal assistant for all my files. Incredible AI technology."
              author="Emma Thompson"
              title="Project Manager"
              company="Tech Innovations Inc"
            />
          </div>
        </div>
      </section>

    

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of professionals who've revolutionized their file
            management. Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-white text-gray-900 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2">
                  <span>Access Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  onClick={() => signIn()}
                  className="bg-white text-gray-900 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all flex items-center space-x-2">
                  <span>Schedule Demo</span>
                  <PlayCircle className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Sortify</h3>
                  <p className="text-gray-400 text-sm">
                    AI-Powered File Intelligence
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transform your file management with artificial intelligence that
                understands, organizes, and optimizes your digital workspace.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Sortify. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Enhanced Components
function EnhancedFeatureCard({
  icon,
  title,
  description,
  gradient,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  features: string[];
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
      <div
        className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
      <div className="mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function EnhancedStatCard({
  number,
  label,
  sublabel,
}: {
  number: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold mb-2">{number}</div>
      <div className="text-lg font-medium mb-1">{label}</div>
      <div className="text-sm opacity-75">{sublabel}</div>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  title,
  company,
}: {
  quote: string;
  author: string;
  title: string;
  company: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <blockquote className="text-gray-700 mb-6 leading-relaxed">
        "{quote}"
      </blockquote>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
          {author.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">
            {title} at {company}
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  popular,
}: {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}) {
  return (
    <div
      className={`bg-white p-8 rounded-2xl border-2 ${
        popular
          ? "border-blue-500 shadow-xl scale-105"
          : "border-gray-200 shadow-lg"
      } relative`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">{period}</span>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          popular
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            : "border-2 border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600"
        }`}
      >
        {buttonText}
      </Button>
    </div>
  );
}

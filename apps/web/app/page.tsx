"use client"
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Search,
  Sparkles,
  Upload,
  Star,
  Play,
  Bot,
  Eye,
  Share2,
  BarChart3,
  Workflow,
  Lightbulb,
  CheckCircle,
  Zap,
  Shield,
  Users,
  TrendingUp,
  FileText,
  Folder,
  Clock,
  Target,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/api/auth/signin");
    }
  };

  const demoSteps = [
    {
      title: "Smart Upload & Analysis",
      description: "AI instantly understands and categorizes your files",
      icon: <Upload className="h-5 w-5" />,
      progress: 100,
    },
    {
      title: "Intelligent Organization",
      description: "Automatic folder structure based on content",
      icon: <Brain className="h-5 w-5" />,
      progress: 85,
    },
    {
      title: "Natural Search",
      description: "Find anything with conversational queries",
      icon: <Search className="h-5 w-5" />,
      progress: 92,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Sortify</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 font-medium">Demo</a>
              {session ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium">{session.user?.name || 'User'}</span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button 
                        onClick={() => { router.push("/dashboard"); setIsDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-900">Dashboard</span>
                      </button>
                      <button 
                        onClick={() => { router.push("/profile"); setIsDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-900">Profile</span>
                      </button>
                      <button 
                        onClick={() => { router.push("/settings"); setIsDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-900">Settings</span>
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={() => { signOut(); setIsDropdownOpen(false); }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-3 py-1 border border-blue-200 mb-6">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium text-sm">AI-Powered File Management</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Turn File Chaos Into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Organized Intelligence</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Stop wasting time searching for files. Our AI understands your content, organizes everything automatically, and helps you find anything in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg flex items-center group">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Play className="h-5 w-5" />
                  <span className="font-medium">Watch 2-min demo</span>
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-gray-900">10x</div>
                  <div className="text-sm text-gray-600">Faster Search</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50M+</div>
                  <div className="text-sm text-gray-600">Files Processed</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                {/* Main Dashboard Mockup */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-xl">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Search className="h-4 w-4 text-gray-400" />
                      <div className="text-gray-400">Find presentations about Q4 results...</div>
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* File Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: "Q4 Results.pptx", type: "presentation", color: "bg-orange-100 text-orange-600" },
                      { name: "Budget 2024.xlsx", type: "spreadsheet", color: "bg-green-100 text-green-600" },
                      { name: "Strategy.pdf", type: "document", color: "bg-red-100 text-red-600" },
                      { name: "Team Photos", type: "folder", color: "bg-blue-100 text-blue-600" },
                    ].map((file, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 ${file.color} rounded-lg flex items-center justify-center`}>
                            {file.type === 'folder' ? (
                              <Folder className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">2 days ago</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* AI Suggestions */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">AI Suggestion</span>
                    </div>
                    <div className="text-xs text-blue-700">Found 3 related documents in "Financial Reports" folder</div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-green-500 text-white p-3 rounded-full shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">AI Processing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See How AI Transforms Your Workflow
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch our AI analyze, organize, and surface your files in real-time
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className={`relative p-6 rounded-xl transition-all duration-500 ${
                    currentDemo === index
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                      currentDemo === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Processing</span>
                      <span className="text-xs font-medium text-gray-700">{step.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          currentDemo === index ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        style={{ width: currentDemo === index ? `${step.progress}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                  
                  {currentDemo === index && (
                    <div className="text-xs text-blue-600 font-medium flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                      Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage, organize, and collaborate on files efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI Content Analysis",
                description: "Automatically extract insights, tags, and metadata from any file type",
                color: "bg-blue-100 text-blue-600"
              },
              {
                icon: <Search className="h-6 w-6" />,
                title: "Natural Language Search",
                description: "Find files by describing what you're looking for in plain English",
                color: "bg-green-100 text-green-600"
              },
              {
                icon: <Workflow className="h-6 w-6" />,
                title: "Smart Organization",
                description: "AI creates folder structures based on content and usage patterns",
                color: "bg-purple-100 text-purple-600"
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Enterprise Security",
                description: "Bank-grade encryption with granular permissions and access controls",
                color: "bg-red-100 text-red-600"
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Team Collaboration",
                description: "Share files securely with real-time collaboration and version control",
                color: "bg-indigo-100 text-indigo-600"
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Usage Analytics",
                description: "Insights into file usage, team productivity, and storage optimization",
                color: "bg-orange-100 text-orange-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by 10,000+ Teams
            </h2>
            <p className="text-lg text-gray-600">
              From startups to enterprise, teams choose Sortify for intelligent file management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Sortify saved us 20 hours per week in file organization. The AI search is incredibly accurate.",
                author: "Sarah Chen",
                role: "Operations Director",
                company: "TechFlow",
                avatar: "SC"
              },
              {
                quote: "Finally, a tool that understands our content as well as we do. Game-changer for our team.",
                author: "Michael Rodriguez", 
                role: "Product Manager",
                company: "DataCorp",
                avatar: "MR"
              },
              {
                quote: "The natural language search is magical. I can find anything by just describing it.",
                author: "Emily Johnson",
                role: "Design Lead",
                company: "CreativeStudio",
                avatar: "EJ"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your File Management?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams who have revolutionized their productivity with AI
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center group"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-blue-100 text-sm space-y-1">
              <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />14-day free trial</div>
              <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" />No credit card required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Sortify</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-600 text-sm">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
            <p>&copy; 2025 Sortify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
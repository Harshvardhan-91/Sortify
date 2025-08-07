import { Cloud, Brain, Search, Share2, FileText, Image, FolderOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Sortify</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#demo" className="text-gray-600 hover:text-gray-900">Demo</a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            AI-Powered
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Cloud Storage
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Store, organize, and find your files with the power of artificial intelligence. 
            Automatic tagging, smart summaries, and semantic search that actually understands your content.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
              Start Free Trial
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-blue-600" />}
            title="AI Understanding"
            description="Every file is automatically analyzed and understood. PDFs get summaries, images get smart tags, and documents get key insights extracted."
          />
          
          <FeatureCard
            icon={<Search className="h-8 w-8 text-green-600" />}
            title="Semantic Search"
            description="Ask questions like 'Where's my tax document from last year?' and find exactly what you need, even if you can't remember the filename."
          />
          
          <FeatureCard
            icon={<FolderOpen className="h-8 w-8 text-purple-600" />}
            title="Smart Organization"
            description="Files organize themselves automatically based on content, type, and context. No more manual folder management."
          />
          
          <FeatureCard
            icon={<Share2 className="h-8 w-8 text-orange-600" />}
            title="Secure Sharing"
            description="Share files with expiring links, password protection, and granular permissions. Full control over your data."
          />
          
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-red-600" />}
            title="Instant Summaries"
            description="Get TL;DR summaries of long documents, research papers, and reports. Save time and stay informed."
          />
          
          <FeatureCard
            icon={<Image className="h-8 w-8 text-indigo-600" />}
            title="Visual Recognition"
            description="Images are automatically tagged with objects, text, and scenes. Find photos by describing what's in them."
          />
        </section>

        {/* Stats Section */}
        <section className="mt-24 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="10K+" label="Files Processed" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="5TB+" label="Storage Available" />
            <StatCard number="500+" label="Happy Users" />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your File Management?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users who've revolutionized how they store and find files.</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
            Get Started Now - Free Forever
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Cloud className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Sortify</span>
          </div>
          <p>&copy; 2025 Sortify. Built with ❤️ for developers and power users.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

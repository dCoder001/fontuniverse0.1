import { useState } from 'react'
import { Layout } from './components/Layout'
import { PromptOptimizer } from './components/PromptOptimizer'
import { FontGenerator } from './components/FontGenerator'
import { Sparkles, Type, Home, Menu, X } from 'lucide-react'

type View = 'home' | 'optimizer' | 'fonts';

function App() {
  const [view, setView] = useState<View>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = (newView: View) => {
    setView(newView);
    setIsMenuOpen(false);
  };

  return (
    <Layout>
      <nav className="border-b border-white/10 bg-galaxy-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
              <div className="bg-gradient-to-tr from-primary to-purple-500 p-2 rounded-lg">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Font Universe
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-4">
              <button 
                onClick={() => navigate('home')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === 'home' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Home size={16} /> Home
              </button>
              <button 
                onClick={() => navigate('optimizer')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === 'optimizer' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Sparkles size={16} /> Optimizer
              </button>
              <button 
                onClick={() => navigate('fonts')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${view === 'fonts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Type size={16} /> Font Generator
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-galaxy-900 border-b border-white/10 absolute w-full left-0 top-16 z-40">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => navigate('home')}
                className={`w-full px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3 ${view === 'home' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Home size={20} /> Home
              </button>
              <button 
                onClick={() => navigate('optimizer')}
                className={`w-full px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3 ${view === 'optimizer' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Sparkles size={20} /> Optimizer
              </button>
              <button 
                onClick={() => navigate('fonts')}
                className={`w-full px-3 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3 ${view === 'fonts' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Type size={20} /> Font Generator
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="container mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-galaxy-900 p-8 rounded-full border border-white/10">
                <Sparkles className="w-20 h-20 text-primary" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-white">
              Font Universe
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              The ultimate platform for AI-powered text generation and typography. 
              Create, optimize, and style your content with the power of the cosmos.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('optimizer')}
                className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                Try Prompt Optimizer
              </button>
              <button 
                onClick={() => navigate('fonts')}
                className="px-8 py-3 bg-galaxy-800 hover:bg-galaxy-700 text-white rounded-xl font-semibold transition-all hover:scale-105 border border-white/10"
              >
                Explore Fonts
              </button>
            </div>
          </div>
        )}

        {view === 'optimizer' && <PromptOptimizer />}

        {view === 'fonts' && <FontGenerator />}
      </main>
    </Layout>
  )
}

export default App

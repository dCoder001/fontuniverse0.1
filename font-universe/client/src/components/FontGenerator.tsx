import React, { useState, useRef } from 'react';
import { Type, RefreshCw, Sparkles, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GOOGLE_FONTS } from '../data/fonts';

interface Font {
  family: string;
  category: string;
}

export const FontGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('Font Universe');
  const [generationType, setGenerationType] = useState('heading');
  const [selectedFont, setSelectedFont] = useState<Font>(GOOGLE_FONTS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const FONTS_PER_PAGE = 20;
  
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredFonts = GOOGLE_FONTS.filter(font => {
    const matchesSearch = font.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || font.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFonts.length / FONTS_PER_PAGE);
  const displayedFonts = filteredFonts.slice(
    (currentPage - 1) * FONTS_PER_PAGE,
    currentPage * FONTS_PER_PAGE
  );

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const handleRandomFont = () => {
    const randomIndex = Math.floor(Math.random() * filteredFonts.length);
    setSelectedFont(filteredFonts[randomIndex]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputText,
          type: generationType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();
      setGeneratedText(data.text);
    } catch (error) {
      console.error('Error generating text:', error);
      alert('AI Service is currently overloaded (503). Using original text.');
      setGeneratedText(inputText);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!previewRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null, // Transparent background if possible, or matches container
        scale: 2, // Higher resolution
        useCORS: true, // For cross-origin images like textures
        logging: false
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `font-universe-${selectedFont.family.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Type className="text-primary" /> Font Generator
        </h2>
        <p className="text-gray-400">Explore our curated collection of fonts and generate stunning text designs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6 bg-galaxy-800/50 p-6 rounded-2xl border border-galaxy-700 backdrop-blur-sm h-fit">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Generation Type</label>
              <select 
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value)}
                className="w-full bg-galaxy-900/50 border border-galaxy-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="heading">Heading</option>
                <option value="quote">Inspirational Quote</option>
                <option value="paragraph">Short Paragraph</option>
                <option value="slogan">Brand Slogan</option>
                <option value="poetry">Poetry Snippet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Text Content / Prompt</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-24 bg-galaxy-900/50 border border-galaxy-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Enter text to style..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Font Selection ({filteredFonts.length})</label>
                <button 
                  onClick={handleRandomFont}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                  title="Pick a random font"
                >
                  <RefreshCw size={12} /> Random
                </button>
              </div>
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-galaxy-900/50 border border-galaxy-700 rounded-lg p-2 text-white text-sm mb-2 focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-galaxy-700">
                {['all', 'serif', 'sans-serif', 'script', 'display'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-primary text-white' : 'bg-galaxy-900 text-gray-400 hover:text-white'}`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              <div className="h-64 flex flex-col space-y-2">
                <div className="flex-1 overflow-y-auto space-y-1 bg-galaxy-900/50 rounded-lg border border-galaxy-700 p-2 scrollbar-thin scrollbar-thumb-galaxy-700">
                  {displayedFonts.length > 0 ? (
                    displayedFonts.map(font => (
                      <button
                        key={font.family}
                        onClick={() => setSelectedFont(font)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center group ${selectedFont.family === font.family ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-300 hover:bg-white/5'}`}
                      >
                        <span className="group-hover:text-white transition-colors">{font.family}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">{font.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4 text-sm">No fonts found</div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Size: {fontSize}px</label>
              <input 
                type="range" 
                min="12" 
                max="120" 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 bg-galaxy-900/50 border border-galaxy-700 rounded-lg px-3 text-white text-sm uppercase"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate Design
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-galaxy-800/50 rounded-2xl border border-galaxy-700 backdrop-blur-sm p-8 flex flex-col min-h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Preview</h3>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`p-2 hover:bg-galaxy-700 rounded-lg text-gray-400 hover:text-white transition-colors ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Export Design"
              aria-label="Export Design"
            >
              {isExporting ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
            </button>
          </div>
          
          <div ref={previewRef} className="flex-1 bg-galaxy-900/50 rounded-xl border border-galaxy-700 overflow-hidden relative flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
            {/* Load Google Font dynamically */}
            <style>
              {`@import url('https://fonts.googleapis.com/css2?family=${selectedFont.family.replace(/ /g, '+')}&display=swap');`}
            </style>
            
            <div 
              style={{ 
                fontFamily: selectedFont.family,
                fontSize: `${fontSize}px`,
                color: textColor,
                textAlign: 'center',
                lineHeight: 1.2,
                textShadow: '0 0 20px rgba(255,255,255,0.1)'
              }}
              className="break-words max-w-full"
            >
              {generatedText || inputText}
            </div>
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Font: {selectedFont.family}</span>
            <span>Size: {fontSize}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Type, RefreshCw, Sparkles, Download, Copy, Check, ChevronDown, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GOOGLE_FONTS } from '../data/fonts';
import { convertToUnicode, UnicodeStyle } from '../utils/unicodeFontConverter';
import { ColorSelector } from './ColorSelector';
import { AnimatePresence, motion } from 'framer-motion';

interface Font {
  family: string;
  category: string;
}

const UNICODE_STYLE_MAP: Record<string, UnicodeStyle | string> = {
  'Fraktur (Unicode)': 'fraktur',
  'Bold Script (Unicode)': 'bold_script',
  'Double Struck (Unicode)': 'double_struck',
  'Monospace (Unicode)': 'monospace',
  'Small Caps (Unicode)': 'smallCaps', // Will return plain text with current converter unless extended
};

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
  const [showToast, setShowToast] = useState(false);
  
  const FONTS_PER_PAGE = 20;
  
  const previewRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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
        backgroundColor: null,
        scale: 2,
        useCORS: true,
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

  const getCopyStyles = () => {
    const el = textRef.current;
    const cs = el ? window.getComputedStyle(el) : undefined;
    const family = selectedFont.family;
    const weight = cs?.fontWeight || 'normal';
    const style = cs?.fontStyle || 'normal';
    const sizePx = cs?.fontSize || `${fontSize}px`;
    const colorCss = cs?.color || textColor;
    const decoration = cs?.textDecoration || 'none';
    return { family, weight, style, sizePx, colorCss, decoration };
  };

  const escapeRtf = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}').replace(/\n/g, '\\par ');

  const buildClipboardPayload = (text: string) => {
    const { family, weight, style, sizePx, colorCss, decoration } = getCopyStyles();
    const sizeNumPx = Number(String(sizePx).replace('px', '')) || fontSize;
    const sizePt = Math.round(sizeNumPx * 0.75); // px → pt approx
    const rtfSizeHalfPoints = sizePt * 2;
    const boldOn = ['bold', '700', '800', '900'].includes(String(weight));
    const italicOn = String(style) === 'italic';
    const underlineOn = String(decoration).includes('underline');

    const html =
      `<span style="font-family:'${family}', sans-serif; font-weight:${weight}; font-style:${style}; font-size:${sizeNumPx}px; color:${colorCss}; text-decoration:${decoration};">${text}</span>`;

    const rtf =
      `{\\rtf1\\ansi{\\fonttbl{\\f0 ${family};}}` +
      `\\f0\\fs${rtfSizeHalfPoints}` +
      `${boldOn ? '\\b' : ''}${italicOn ? '\\i' : ''}${underlineOn ? '\\ul' : ''} ` +
      `${escapeRtf(text)} ` +
      `${underlineOn ? '\\ul0 ' : ''}${italicOn ? '\\i0 ' : ''}${boldOn ? '\\b0 ' : ''}}`;

    return { html, rtf };
  };

  const handleCopy = async () => {
    const textToCopy = generatedText || inputText;

    if (selectedFont.category === 'social') {
      const convertedText = convertToUnicode(textToCopy, UNICODE_STYLE_MAP[selectedFont.family]);
      try {
        await navigator.clipboard.writeText(convertedText);
        setIsCopied(true);
        setShowToast(true);
        setTimeout(() => { setShowToast(false); setIsCopied(false); }, 2000);
      } catch (err) {
        console.error('Unicode copy failed:', err);
        // Fallback for Unicode copy
        try {
          const textArea = document.createElement("textarea");
          textArea.value = convertToUnicode(textToCopy, UNICODE_STYLE_MAP[selectedFont.family]);
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setIsCopied(true);
          setShowToast(true);
          setTimeout(() => { setShowToast(false); setIsCopied(false); }, 2000);
        } catch (fallbackErr) {
          console.error('Unicode fallback copy failed:', fallbackErr);
          alert('Failed to copy to clipboard');
        }
      }
      return;
    }

    try {
      const { html, rtf } = buildClipboardPayload(textToCopy);
      const items: Record<string, Blob> = {
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([textToCopy], { type: 'text/plain' }),
      };
      try {
        items['text/rtf'] = new Blob([rtf], { type: 'text/rtf' });
      } catch {}
      // Primary modern API
      await navigator.clipboard.write([new ClipboardItem(items)]);
      setIsCopied(true);
      setShowToast(true);
      setTimeout(() => { setShowToast(false); setIsCopied(false); }, 2000);
    } catch (err) {
      console.error('ClipboardItem failed, falling back:', err);
      // Fallback using execCommand for older browsers
      try {
        const { html } = buildClipboardPayload(textToCopy);
        const tmp = document.createElement('div');
        tmp.contentEditable = 'true';
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        tmp.innerHTML = html;
        document.body.appendChild(tmp);
        const range = document.createRange();
        range.selectNodeContents(tmp);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('copy');
        document.body.removeChild(tmp);
        sel?.removeAllRanges();
        setIsCopied(true);
        setShowToast(true);
        setTimeout(() => { setShowToast(false); setIsCopied(false); }, 2000);
      } catch (fallbackErr) {
        console.error('execCommand fallback failed:', fallbackErr);
        // Final fallback to plain text
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setShowToast(true);
        setTimeout(() => { setShowToast(false); setIsCopied(false); }, 2000);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 pb-24 md:pb-6 relative">
      <div className="text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Type className="text-primary" /> Font Generator
        </h2>
        <p className="text-gray-400 text-sm md:text-base">Explore our curated collection of fonts and generate stunning text designs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6 bg-galaxy-800/50 p-4 md:p-6 rounded-2xl border border-galaxy-700 backdrop-blur-sm h-fit">
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-semibold text-white">Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Generation Type</label>
              <select 
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value)}
                className="w-full bg-galaxy-900/50 border border-galaxy-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary min-h-[48px]"
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
                className="w-full h-24 bg-galaxy-900/50 border border-galaxy-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary resize-none text-base"
                placeholder="Enter text to style..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">Font Selection ({filteredFonts.length})</label>
                <button 
                  onClick={handleRandomFont}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 p-2 min-h-[44px] min-w-[44px] justify-center"
                  title="Pick a random font"
                >
                  <RefreshCw size={16} /> Random
                </button>
              </div>
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-galaxy-900/50 border border-galaxy-700 rounded-lg p-3 text-white text-base mb-2 focus:outline-none focus:border-primary min-h-[48px]"
              />
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-galaxy-700 touch-pan-x">
                {['all', 'serif', 'sans-serif', 'script', 'display', 'social'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[40px] ${categoryFilter === cat ? 'bg-primary text-white' : 'bg-galaxy-900 text-gray-400 hover:text-white'}`}
                  >
                    {cat === 'social' && <Share2 size={14} className="inline mr-1" />}
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
                        className={`w-full text-left px-3 py-3 rounded-md text-base transition-colors flex justify-between items-center group min-h-[48px] ${selectedFont.family === font.family ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-300 hover:bg-white/5'}`}
                      >
                        <span className="group-hover:text-white transition-colors truncate pr-2">{font.family}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 whitespace-nowrap">{font.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4 text-sm">No fonts found</div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center text-sm text-gray-400 px-1 pt-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-2 min-h-[44px]"
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-2 min-h-[44px]"
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
                className="w-full accent-primary h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Color</label>
              <ColorSelector selectedColor={textColor} onColorSelect={setTextColor} />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-galaxy-800/50 rounded-2xl border border-galaxy-700 backdrop-blur-sm p-4 md:p-8 flex flex-col min-h-[400px] md:min-h-[600px] relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-white">Preview</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="p-3 hover:bg-galaxy-700 rounded-lg text-gray-400 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Copy to Clipboard"
                aria-label="Copy to Clipboard"
              >
                <Copy size={20} />
              </button>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className={`p-3 hover:bg-galaxy-700 rounded-lg text-gray-400 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Export Design"
                aria-label="Export Design"
              >
                {isExporting ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
              </button>
            </div>
          </div>
          
          <div ref={previewRef} className="flex-1 bg-galaxy-900/50 rounded-xl border border-galaxy-700 overflow-hidden relative flex items-center justify-center p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] min-h-[300px]">
            {/* Load Google Font dynamically only if not social */}
            {selectedFont.category !== 'social' && (
              <style>
                {`@import url('https://fonts.googleapis.com/css2?family=${selectedFont.family.replace(/ /g, '+')}&display=swap');`}
              </style>
            )}
            
            <div 
              ref={textRef}
              style={{ 
                fontFamily: selectedFont.category === 'social' ? 'sans-serif' : selectedFont.family,
                fontSize: `${Math.max(16, fontSize)}px`, 
                color: textColor,
                textAlign: 'center',
                lineHeight: 1.2,
                textShadow: '0 0 20px rgba(255,255,255,0.1)'
              }}
              onCopy={(e) => {
                // Let standard copy event handle the selection, which will include the unicode characters
                // if they are rendered in the DOM. 
                // We show toast manually.
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }}
              data-font-family={selectedFont.family}
              data-font-size={fontSize}
              data-color={textColor}
              className="break-words max-w-full"
            >
              {selectedFont.category === 'social' 
                ? convertToUnicode(generatedText || inputText, UNICODE_STYLE_MAP[selectedFont.family])
                : (generatedText || inputText)
              }
            </div>
          </div>
          
          <div className="mt-4 flex flex-col md:flex-row justify-between text-sm text-gray-500 gap-2">
            <span>Font: {selectedFont.family}</span>
            <span>Size: {fontSize}px</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile / Sticky Button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          aria-label="Generate Design"
        >
          {loading ? <RefreshCw className="animate-spin" size={24} /> : <Sparkles size={24} />}
        </button>
      </div>

      {/* Desktop Generate Button (hidden on mobile) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
         <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            Generate Design
          </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-galaxy-800 text-white px-6 py-3 rounded-full shadow-xl border border-galaxy-700 flex items-center gap-2 z-50"
          >
            <Check size={18} className="text-green-400" />
            <span>Copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

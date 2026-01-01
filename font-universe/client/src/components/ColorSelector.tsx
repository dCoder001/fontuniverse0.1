import React, { useState, useEffect } from 'react';
import { Search, History, Heart, Check } from 'lucide-react';
import { PREDEFINED_COLORS } from '../data/colors';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface ColorSelectorProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColor, onColorSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'neutral' | 'warm' | 'cool' | 'custom'>('all');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [customHex, setCustomHex] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const savedRecents = localStorage.getItem('font-universe-recent-colors');
    const savedFavorites = localStorage.getItem('font-universe-favorite-colors');
    if (savedRecents) setRecentColors(JSON.parse(savedRecents));
    if (savedFavorites) setFavoriteColors(JSON.parse(savedFavorites));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('font-universe-recent-colors', JSON.stringify(recentColors));
  }, [recentColors]);

  useEffect(() => {
    localStorage.setItem('font-universe-favorite-colors', JSON.stringify(favoriteColors));
  }, [favoriteColors]);

  const handleColorClick = (colorValue: string) => {
    onColorSelect(colorValue);
    
    // Add to recent
    setRecentColors(prev => {
      const newRecents = [colorValue, ...prev.filter(c => c !== colorValue)].slice(0, 10);
      return newRecents;
    });
  };

  const toggleFavorite = (e: React.MouseEvent, colorValue: string) => {
    e.stopPropagation();
    setFavoriteColors(prev => {
      if (prev.includes(colorValue)) {
        return prev.filter(c => c !== colorValue);
      } else {
        return [...prev, colorValue];
      }
    });
  };

  const hexToRgb = (hex: string) => {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  const filteredColors = PREDEFINED_COLORS.filter(color => 
    (color.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     color.value.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === 'all' ? true : color.category === categoryFilter)
  );

  const getDisplayColors = () => {
    switch (activeTab) {
      case 'recent':
        return recentColors.map(c => {
            const predefined = PREDEFINED_COLORS.find(p => p.value === c);
            return predefined || { name: c, value: c, category: 'custom' };
        });
      case 'favorites':
        return favoriteColors.map(c => {
            const predefined = PREDEFINED_COLORS.find(p => p.value === c);
            return predefined || { name: c, value: c, category: 'custom' };
        });
      default:
        return filteredColors;
    }
  };

  const displayColors = getDisplayColors();

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const options = gridRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!options || options.length === 0) return;
    const active = document.activeElement as HTMLButtonElement | null;
    const idx = active ? Array.from(options).indexOf(active) : -1;
    const cols = (() => {
      const style = gridRef.current ? getComputedStyle(gridRef.current) : null;
      const template = style?.getPropertyValue('grid-template-columns') || '';
      const count = template.split(' ').filter(Boolean).length;
      return count || 5;
    })();
    let nextIdx = idx;
    switch (e.key) {
      case 'ArrowRight':
        nextIdx = Math.min(options.length - 1, (idx < 0 ? 0 : idx + 1));
        break;
      case 'ArrowLeft':
        nextIdx = Math.max(0, (idx < 0 ? 0 : idx - 1));
        break;
      case 'ArrowDown':
        nextIdx = Math.min(options.length - 1, (idx < 0 ? 0 : idx + cols));
        break;
      case 'ArrowUp':
        nextIdx = Math.max(0, (idx < 0 ? 0 : idx - cols));
        break;
      default:
        return;
    }
    e.preventDefault();
    options[nextIdx]?.focus();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">Color Selection</label>
        <div className="flex bg-galaxy-900 rounded-lg p-1 gap-1">
            <button
                onClick={() => setActiveTab('all')}
                className={`p-1.5 rounded-md transition-colors ${activeTab === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                title="All Colors"
            >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-[1px]"></div>
                    <div className="bg-current rounded-[1px]"></div>
                    <div className="bg-current rounded-[1px]"></div>
                    <div className="bg-current rounded-[1px]"></div>
                </div>
            </button>
            <button
                onClick={() => setActiveTab('recent')}
                className={`p-1.5 rounded-md transition-colors ${activeTab === 'recent' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                title="Recent History"
            >
                <History size={16} />
            </button>
            <button
                onClick={() => setActiveTab('favorites')}
                className={`p-1.5 rounded-md transition-colors ${activeTab === 'favorites' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                title="Favorites"
            >
                <Heart size={16} />
            </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Search colors (name or hex)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-galaxy-900/50 border border-galaxy-700 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
          />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all','neutral','warm','cool','custom'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-primary text-white' : 'bg-galaxy-900 text-gray-400 hover:text-white'}`}
            aria-pressed={categoryFilter === cat}
          >
            {cat[0].toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-galaxy-700 p-1"
        role="listbox"
        aria-label="Color palette"
        onKeyDown={handleGridKeyDown}
      >
        {displayColors.map((color) => (
          <motion.div
            key={color.value}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <button
              onClick={() => handleColorClick(color.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleColorClick(color.value);
                }
                if (e.key.toLowerCase() === 'f') {
                  toggleFavorite(e as unknown as React.MouseEvent, color.value);
                }
              }}
              className={`relative aspect-square w-full rounded-lg border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${selectedColor === color.value ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-white/30'}`}
              style={{ backgroundColor: color.value }}
              title={`${color.name} (${color.value})`}
              aria-label={`Select ${color.name} color`}
              aria-selected={selectedColor === color.value}
              role="option"
              tabIndex={0}
            >
              {selectedColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check size={16} className={['#ffffff', '#f43f5e', '#eab308', '#22c55e', '#06b6d4', '#0ea5e9'].includes(color.value) ? 'text-black' : 'text-white'} />
                </div>
              )}
              {/* Favorite action */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div 
                  onClick={(e) => toggleFavorite(e, color.value)}
                  className="bg-galaxy-900 rounded-full p-1 shadow-md cursor-pointer hover:bg-galaxy-700 border border-galaxy-700"
                  aria-label={favoriteColors.includes(color.value) ? 'Remove from favorites' : 'Add to favorites'}
                  role="button"
                  tabIndex={0}
                >
                  <Heart size={10} className={favoriteColors.includes(color.value) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </div>
              </div>
            </button>
            <div className="mt-1 px-1">
              <div className="text-xs text-white/90 truncate">{color.name}</div>
              <div className="text-[10px] text-gray-400 font-mono uppercase">{color.value} · rgb({hexToRgb(color.value)})</div>
            </div>
          </motion.div>
        ))}
        
        {displayColors.length === 0 && (
            <div className="col-span-5 text-center py-8 text-gray-500 text-sm">
                {activeTab === 'recent' ? 'No recent colors' : 
                 activeTab === 'favorites' ? 'No favorite colors' : 
                 'No colors found'}
            </div>
        )}
      </div>

      {/* Manual Hex Input */}
      <div className="flex gap-2 pt-2 border-t border-galaxy-700/50">
        <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">#</span>
            <input 
                type="text" 
                value={customHex.replace('#', '')}
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9A-Fa-f]*$/.test(val) && val.length <= 6) {
                        setCustomHex(val);
                        if (val.length === 6) {
                            handleColorClick(`#${val}`);
                        }
                    }
                }}
                placeholder="Custom Hex"
                className="w-full bg-galaxy-900/50 border border-galaxy-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-primary uppercase font-mono"
                maxLength={6}
            />
        </div>
        <div 
            className="w-10 h-10 rounded-lg border border-galaxy-700"
            style={{ backgroundColor: customHex.length === 6 ? `#${customHex}` : selectedColor }}
        />
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Tag, 
  FileText, 
  Image, 
  Video,
  Music,
  Archive,
  X,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

interface AISearchProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  recentSearches?: string[];
  suggestions?: SearchSuggestion[];
  className?: string;
}

interface SearchFilters {
  fileTypes?: string[];
  dateRange?: 'today' | 'week' | 'month' | 'year';
  hasAI?: boolean;
  tags?: string[];
}

interface SearchSuggestion {
  type: 'smart' | 'recent' | 'popular';
  text: string;
  description?: string;
  icon?: React.ReactNode;
}

export const AISearch: React.FC<AISearchProps> = ({
  onSearch,
  recentSearches = [],
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [aiSuggestions, setAiSuggestions] = useState<SearchSuggestion[]>([]);

  // Smart suggestions based on query
  useEffect(() => {
    if (query.length > 2) {
      const smartSuggestions: SearchSuggestion[] = [
        {
          type: 'smart',
          text: `Find documents about "${query}"`,
          description: 'AI-powered content search',
          icon: <Sparkles className="h-4 w-4 text-purple-500" />
        },
        {
          type: 'smart',
          text: `Images containing "${query}"`,
          description: 'Visual content analysis',
          icon: <Image className="h-4 w-4 text-green-500" />
        },
        {
          type: 'smart',
          text: `Files tagged with "${query}"`,
          description: 'Tag-based search',
          icon: <Tag className="h-4 w-4 text-blue-500" />
        }
      ];
      setAiSuggestions(smartSuggestions);
    } else {
      setAiSuggestions([]);
    }
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, filters);
      setIsOpen(false);
    }
  };

  const fileTypeIcons = {
    image: <Image className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    audio: <Music className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    archive: <Archive className="h-4 w-4" />
  };

  const quickFilters = [
    { key: 'image', label: 'Images', icon: fileTypeIcons.image },
    { key: 'video', label: 'Videos', icon: fileTypeIcons.video },
    { key: 'audio', label: 'Audio', icon: fileTypeIcons.audio },
    { key: 'document', label: 'Documents', icon: fileTypeIcons.document },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search in Sortify"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg 
                   bg-white text-gray-900 placeholder-gray-500
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                   hover:border-gray-300"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Quick Filters */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    const newTypes = filters.fileTypes?.includes(filter.key) 
                      ? filters.fileTypes.filter(t => t !== filter.key)
                      : [...(filters.fileTypes || []), filter.key];
                    setFilters({ ...filters, fileTypes: newTypes });
                  }}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full transition-colors ${
                    filters.fileTypes?.includes(filter.key)
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Suggestions</span>
              </div>
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion.text)}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {suggestion.icon}
                  <div>
                    <div className="text-sm text-gray-900">{suggestion.text}</div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-500">{suggestion.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent</span>
              </div>
              {recentSearches.slice(0, 3).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          <div className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Popular</span>
            </div>
            {['recent documents', 'images from this week', 'shared files', 'large files'].map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearch(search)}
                className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Star className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click away handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

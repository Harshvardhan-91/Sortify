import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from './utils';

interface SearchBarProps {
  value?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  suggestions?: Array<{
    type: 'filename' | 'tag' | 'keyword';
    value: string;
  }>;
  className?: string;
}

export function SearchBar({
  value = '',
  onSearch,
  onClear,
  placeholder = 'Search files, tags, or content...',
  suggestions = [],
  className
}: SearchBarProps) {
  const [query, setQuery] = React.useState(value);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(newQuery.length > 1);
    setSelectedSuggestion(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    if (onClear) {
      onClear();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedSuggestion >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestion].value);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  return (
    <div className={cn('ui:relative ui:w-full ui:max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="ui:relative">
        <div className="ui:relative ui:flex ui:items-center">
          <Search className="ui:absolute ui:left-3 ui:h-4 ui:w-4 ui:text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(query.length > 1)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="ui:w-full ui:rounded-lg ui:border ui:border-gray-300 ui:bg-white ui:py-2 ui:pl-10 ui:pr-10 ui:text-sm ui:transition-colors focus:ui:border-blue-500 focus:ui:outline-none focus:ui:ring-2 focus:ui:ring-blue-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="ui:absolute ui:right-3 ui:text-gray-400 hover:ui:text-gray-600"
            >
              <X className="ui:h-4 ui:w-4" />
            </button>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="ui:absolute ui:top-full ui:z-50 ui:mt-1 ui:w-full ui:rounded-md ui:border ui:border-gray-200 ui:bg-white ui:shadow-lg">
          <div className="ui:max-h-60 ui:overflow-y-auto ui:py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.value)}
                className={cn(
                  'ui:flex ui:w-full ui:items-center ui:space-x-2 ui:px-3 ui:py-2 ui:text-left ui:text-sm ui:transition-colors',
                  {
                    'ui:bg-blue-50 ui:text-blue-900': selectedSuggestion === index,
                    'ui:text-gray-900 hover:ui:bg-gray-50': selectedSuggestion !== index,
                  }
                )}
              >
                <span className={cn(
                  'ui:inline-flex ui:items-center ui:rounded ui:px-1.5 ui:py-0.5 ui:text-xs ui:font-medium',
                  {
                    'ui:bg-blue-100 ui:text-blue-800': suggestion.type === 'filename',
                    'ui:bg-green-100 ui:text-green-800': suggestion.type === 'tag',
                    'ui:bg-purple-100 ui:text-purple-800': suggestion.type === 'keyword',
                  }
                )}>
                  {suggestion.type}
                </span>
                <span className="ui:truncate">{suggestion.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

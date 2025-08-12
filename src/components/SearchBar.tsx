import React, { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { debounce } from '@/utils/debounce';

export interface SearchFilters {
  vegetarian: boolean;
  nonVegetarian: boolean;
  category?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  filters: SearchFilters;
  placeholder?: string;
  isLoading?: boolean;
}

const categories = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous', 
  'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 
  'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
];

export function SearchBar({ 
  onSearch, 
  onFiltersChange, 
  filters, 
  placeholder = "Search by ingredients (e.g., chicken, tomato, garlic)",
  isLoading = false 
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, 500),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: boolean | string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="pl-12 pr-12 h-14 text-lg bg-card/80 backdrop-blur-sm border-border/20 focus:bg-card transition-colors"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-sm border-border/20">
            <DropdownMenuLabel>Dietary Preferences</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.vegetarian}
              onCheckedChange={(checked) => handleFilterChange('vegetarian', checked)}
            >
              Vegetarian Only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.nonVegetarian}
              onCheckedChange={(checked) => handleFilterChange('nonVegetarian', checked)}
            >
              Non-Vegetarian Only
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.category === category}
                onCheckedChange={(checked) => 
                  handleFilterChange('category', checked ? category : '')
                }
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters */}
        {filters.vegetarian && (
          <Badge variant="secondary" className="gap-1">
            Vegetarian
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => handleFilterChange('vegetarian', false)}
            />
          </Badge>
        )}
        {filters.nonVegetarian && (
          <Badge variant="secondary" className="gap-1">
            Non-Vegetarian
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => handleFilterChange('nonVegetarian', false)}
            />
          </Badge>
        )}
        {filters.category && (
          <Badge variant="secondary" className="gap-1">
            {filters.category}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => handleFilterChange('category', '')}
            />
          </Badge>
        )}
      </div>
    </div>
  );
}
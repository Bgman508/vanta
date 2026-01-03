import { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdvancedFilters({ onFilterChange }) {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedStates, setSelectedStates] = useState(['live']);
  const [sortBy, setSortBy] = useState('recent');

  const applyFilters = () => {
    onFilterChange({
      priceRange,
      states: selectedStates,
      sortBy
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-neutral-800">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-neutral-900 border-neutral-800 w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-white">Advanced Filters</h4>

          <div>
            <label className="text-xs text-neutral-400 mb-2 block">Price Range (cents)</label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={5000}
              step={100}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>${(priceRange[0] / 100).toFixed(2)}</span>
              <span>${(priceRange[1] / 100).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-2 block">State</label>
            <div className="space-y-2">
              {['draft', 'scheduled', 'live', 'archived'].map(state => (
                <label key={state} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedStates.includes(state)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStates([...selectedStates, state]);
                      } else {
                        setSelectedStates(selectedStates.filter(s => s !== state));
                      }
                    }}
                  />
                  <span className="text-sm text-white capitalize">{state}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={applyFilters} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
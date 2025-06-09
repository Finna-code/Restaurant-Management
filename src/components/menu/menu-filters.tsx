
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DietaryTag } from '@/lib/types';
import { DIETARY_TAGS } from '@/lib/types';
import { Filter, IndianRupee, ArrowDownUp, Tags, ListFilter } from 'lucide-react'; // Changed DollarSign to IndianRupee
import { formatInr } from '@/lib/currency-utils';

interface MenuFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedTags: DietaryTag[];
  onTagChange: (tags: DietaryTag[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  initialCategories: string[];
}

const MAX_INR_PRICE = 10000; // Updated to 10000 INR

export function MenuFilters({
  selectedCategories,
  onCategoryChange,
  selectedTags,
  onTagChange,
  priceRange,
  onPriceChange,
  sortBy,
  onSortByChange,
  initialCategories
}: MenuFiltersProps) {

  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName];
    onCategoryChange(newCategories);
  };

  const handleTagToggle = (tag: DietaryTag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagChange(newTags);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center">
          <ListFilter className="mr-2 h-5 w-5 text-primary" />
          Filter & Sort
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-md font-semibold flex items-center mb-2">
            <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" /> Sort By
          </Label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="price_asc">Price (Low to High)</SelectItem>
              <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              <SelectItem value="rating_desc">Rating (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-md font-semibold flex items-center mb-2">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" /> Categories
          </Label>
          {initialCategories.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {initialCategories.map(categoryName => (
                <div key={categoryName} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${categoryName.replace(/\s+/g, '-')}`}
                    checked={selectedCategories.includes(categoryName)}
                    onCheckedChange={() => handleCategoryToggle(categoryName)}
                  />
                  <Label htmlFor={`cat-${categoryName.replace(/\s+/g, '-')}`} className="font-normal cursor-pointer">{categoryName}</Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No categories available to filter.</p>
          )}
        </div>

        <div>
          <Label className="text-md font-semibold flex items-center mb-2">
            <Tags className="mr-2 h-4 w-4 text-muted-foreground" /> Dietary Tags
          </Label>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {DIETARY_TAGS.map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                <Label htmlFor={`tag-${tag}`} className="font-normal cursor-pointer">{tag}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-md font-semibold flex items-center mb-2">
             <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground" /> Price Range (INR)
          </Label>
          <Slider
            min={0}
            max={MAX_INR_PRICE}
            step={100} // Adjusted step for new range
            value={[priceRange[0], priceRange[1]]}
            onValueChange={(value) => onPriceChange(value as [number, number])}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatInr(priceRange[0])}</span>
            <span>{formatInr(priceRange[1])}{priceRange[1] === MAX_INR_PRICE ? '+' : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



'use client';

import { useState, useEffect, useMemo } from 'react';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { MenuFilters } from '@/components/menu/menu-filters';
import { SearchBar } from '@/components/menu/search-bar';
import type { MenuItem, DietaryTag } from '@/lib/types';
import { MENU_CATEGORIES } from '@/lib/types'; // Still used for filter initialization for now
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import React from 'react';
import { formatInr } from '@/lib/currency-utils';

const ITEMS_PER_PAGE = 9;
const DEFAULT_INR_MIN_PRICE = 0;
const DEFAULT_INR_MAX_PRICE = 10000;

function MenuItemCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg h-full animate-fade-in">
      <CardHeader className="p-0">
        <Skeleton className="object-cover w-full h-48" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-1" /> {/* Title */}
        <Skeleton className="h-4 w-1/2 mb-2" /> {/* Rating/Category */}
        <Skeleton className="h-4 w-full mb-1" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-5/6 mb-3" /> {/* Description line 2 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Skeleton className="h-7 w-1/4" /> {/* Price */}
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-20" /> {/* Button */}
          <Skeleton className="h-9 w-24" /> {/* Button */}
        </div>
      </CardFooter>
    </Card>
  );
}

function MenuPageSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center py-8 bg-card rounded-lg shadow">
        <Skeleton className="h-10 w-3/4 mx-auto mb-2" /> {/* Adjusted for dynamic title */}
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
          <Card><CardContent className="p-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              <div><Skeleton className="h-4 w-1/3 mb-1" /><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-4 w-1/3 mb-1" /><Skeleton className="h-5 w-full mb-1" /><Skeleton className="h-5 w-full" /></div>
              <div><Skeleton className="h-4 w-1/3 mb-1" /><Skeleton className="h-5 w-full mb-1" /><Skeleton className="h-5 w-full" /></div>
              <div><Skeleton className="h-4 w-1/3 mb-1" /><Skeleton className="h-8 w-full mt-2" /><div className="flex justify-between mt-1"><Skeleton className="h-4 w-10" /><Skeleton className="h-4 w-10" /></div></div>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3 space-y-8">
          {/* AI Recommendations Card Skeleton Removed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <MenuItemCardSkeleton key={index} />
            ))}
          </div>
          <div className="flex justify-center pt-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_INR_MIN_PRICE, DEFAULT_INR_MAX_PRICE]);
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'rating_desc'>('name_asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [itemsRes, settingsRes] = await Promise.all([
          fetch('/api/menu-items'),
          fetch('/api/settings')
        ]);

        if (!itemsRes.ok) {
          const errorData = await itemsRes.json().catch(() => ({ error: 'Failed to fetch menu items' }));
          throw new Error(errorData.error || `HTTP error! status: ${itemsRes.status}`);
        }
        const itemsJson = await itemsRes.json();
        if (itemsJson.success) {
          const itemsWithDefaults = itemsJson.data.map((item: MenuItem) => ({
            ...item,
            feedbacks: item.feedbacks || [],
            tags: item.tags || [],
            ingredients: item.ingredients || [],
            averageRating: (item.feedbacks && item.feedbacks.length > 0)
              ? item.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / item.feedbacks.length
              : 0
          }));
          setMenuItems(itemsWithDefaults);
        } else {
          throw new Error(itemsJson.error || 'Failed to load menu items.');
        }

        if (settingsRes.ok) {
          const settingsJson = await settingsRes.json();
          if (settingsJson.success && settingsJson.data && settingsJson.data.restaurantName) {
            setRestaurantName(settingsJson.data.restaurantName);
          } else {
            console.warn("Restaurant name not found in settings or API error:", settingsJson.error);
          }
        } else {
          console.warn("Failed to fetch settings for restaurant name.");
        }

      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred. Please try again later.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let items = menuItems;

    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategories.length > 0) {
      items = items.filter(item => selectedCategories.includes(item.category));
    }

    if (selectedTags.length > 0) {
      items = items.filter(item => item.tags && selectedTags.every(tag => item.tags.includes(tag)));
    }

    items = items.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);

    items.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'rating_desc': return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        default: return 0;
      }
    });

    return items;
  }, [menuItems, searchTerm, selectedCategories, selectedTags, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading && menuItems.length === 0 && !restaurantName) {
    return <MenuPageSkeleton />;
  }

  if (error && menuItems.length === 0) { // Only show full page error if menu items failed critical load
    return (
      <Alert variant="destructive" className="my-8 animate-fade-in">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Menu</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  const pageTitle = restaurantName ? `${restaurantName}'s Menu` : "Our Menu";
  const pageDescription = restaurantName ? `Discover delicious dishes from ${restaurantName}, crafted with passion.` : "Discover delicious dishes crafted with passion.";


  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center py-8 bg-card rounded-lg shadow">
        <h1 className="text-4xl font-headline font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{pageDescription}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
          <SearchBar searchTerm={searchTerm} onSearchTermChange={(term) => { setSearchTerm(term); setCurrentPage(1); }} />
          <MenuFilters
            selectedCategories={selectedCategories}
            onCategoryChange={(cats) => { setSelectedCategories(cats); setCurrentPage(1); }}
            selectedTags={selectedTags}
            onTagChange={(tags) => { setSelectedTags(tags); setCurrentPage(1); }}
            priceRange={priceRange}
            onPriceChange={(range) => { setPriceRange(range); setCurrentPage(1); }}
            sortBy={sortBy}
            onSortByChange={(sort) => { setSortBy(sort as any); setCurrentPage(1); }}
            initialCategories={[...MENU_CATEGORIES]}
          />
        </aside>

        <main className="md:col-span-3 space-y-8">
          {/* AIRecommendations component removed */}

          {isLoading && paginatedItems.length === 0 && ( // Show loader if loading and no items yet to display for current page
             <div className="flex justify-center items-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading delicious items...</p>
             </div>
          )}
          
          {error && menuItems.length > 0 && ( // Show subtle error if menu items loaded but settings perhaps failed
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>There was an issue loading some page details, but the menu is available. {error}</AlertDescription>
            </Alert>
          )}


          {!isLoading && paginatedItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedItems.map((item, index) => (
                <MenuItemCard key={item.id || `fallback-menu-${index}`} item={item} />
              ))}
            </div>
          )}

          {!isLoading && filteredAndSortedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No menu items match your criteria or menu is empty.</p>
              <Button variant="link" onClick={() => {
                setSearchTerm('');
                setSelectedCategories([]);
                setSelectedTags([]);
                setPriceRange([DEFAULT_INR_MIN_PRICE, DEFAULT_INR_MAX_PRICE]);
                setCurrentPage(1);
              }}>Clear filters</Button>
            </div>
          )}

          {totalPages > 1 && !isLoading && paginatedItems.length > 0 && (
            <Pagination className="pt-4">
              <PaginationContent>
                <PaginationItem key="prev">
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => totalPages <= 5 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1 || (currentPage <=3 && page <=3) || (currentPage >= totalPages - 2 && page >= totalPages -2 ))
                  .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && page - arr[index-1] > 1 && <PaginationEllipsis />}
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }} isActive={currentPage === page}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}
                <PaginationItem key="next">
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}/>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </main>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import type { MenuItem as MenuItemType } from '@/lib/types';
import type { CategorySettingItem } from '@/models/Settings'; // For managed categories
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { MenuItemForm } from '@/components/menu/menu-item-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInr } from '@/lib/currency-utils';

function AdminMenuPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <Skeleton className="h-7 w-1/2 mb-1" /> {/* CardTitle */}
              <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
            </div>
            <Skeleton className="h-10 w-36 mt-4 sm:mt-0" /> {/* Add New Item Button */}
          </div>
          <div className="mt-4 relative">
            <Skeleton className="h-10 w-full sm:w-1/2 lg:w-1/3" /> {/* Search Input */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {Array(5).fill(0).map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-center">
                     <div className="flex items-center justify-center space-x-2">
                        <Skeleton className="h-6 w-11 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                     </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Skeleton className="h-8 w-8 inline-block" />
                    <Skeleton className="h-8 w-8 inline-block" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [managedCategories, setManagedCategories] = useState<CategorySettingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItemType | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsLoadingCategories(true);
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
          setMenuItems(itemsJson.data);
        } else {
          throw new Error(itemsJson.error || 'Failed to load menu items from API.');
        }

        if (!settingsRes.ok) {
          const errorData = await settingsRes.json().catch(() => ({ error: 'Failed to fetch settings' }));
          console.warn("Failed to load categories for form:", errorData.error || `HTTP error! status: ${settingsRes.status}`);
          setManagedCategories([]); // Set to empty if settings fetch fails
        } else {
          const settingsJson = await settingsRes.json();
          if (settingsJson.success && settingsJson.data && settingsJson.data.managedCategories) {
            setManagedCategories(settingsJson.data.managedCategories);
          } else {
            console.warn("Categories not found in settings or API error:", settingsJson.error);
            setManagedCategories([]);
          }
        }

      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: e.message || 'Failed to load data.' });
      } finally {
        setIsLoading(false);
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleFormSubmit = async (itemData: Omit<MenuItemType, 'id' | 'feedbacks' | 'averageRating' | 'category'> & { id?: string; category: string; }) => {
    setIsSubmitting(true);
    const isEditing = !!editingItem;
    const endpoint = isEditing ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      ...itemData,
      ingredients: itemData.ingredients.map((ing: any) => typeof ing === 'object' && ing.value ? ing.value : ing)
    };
    if(isEditing) delete payload.id;

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || (isEditing ? 'Failed to update item' : 'Failed to add item'));
      }

      const savedItem = result.data as MenuItemType;

      if (isEditing) {
        setMenuItems(prevItems => prevItems.map(i => (i.id === savedItem.id ? savedItem : i)));
        toast({ title: "Success!", description: `${savedItem.name} updated successfully.` });
      } else {
        setMenuItems(prevItems => [savedItem, ...prevItems]);
        toast({ title: "Success!", description: `${savedItem.name} added successfully.` });
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      console.error("Form submission error:", e);
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEdit = (item: MenuItemType) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/menu-items/${itemToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        throw new Error(errorResult?.error || 'Failed to delete item.');
      }
      setMenuItems(prevItems => prevItems.filter(i => i.id !== itemToDelete.id));
      toast({ title: "Success!", description: `${itemToDelete.name} deleted successfully.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error Deleting", description: e.message });
    } finally {
      setItemToDelete(null);
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (item: MenuItemType) => {
    const updatedItem = { ...item, availability: !item.availability };
     try {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: updatedItem.availability }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update availability');
      }
      setMenuItems(prevItems => prevItems.map(i => (i.id === item.id ? result.data : i)));
      toast({ title: "Availability Updated", description: `${item.name} is now ${result.data.availability ? 'available' : 'unavailable'}.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && menuItems.length === 0) {
    return <AdminMenuPageSkeleton />;
  }

  if (error && menuItems.length === 0) {
    return <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded-md animate-fade-in"><AlertTriangle className="inline mr-2"/>{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="font-headline text-2xl">Menu Management</CardTitle>
              <CardDescription>Add, edit, or remove menu items from the database.</CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open && !isSubmitting) setEditingItem(null); }}>
              <DialogTrigger asChild>
                <Button
                  className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isLoadingCategories || managedCategories.length === 0}
                  title={isLoadingCategories || managedCategories.length === 0 ? "Loading categories or no categories defined in settings" : "Add New Item"}
                >
                  {isLoadingCategories ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                   Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-headline">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? `Update details for ${editingItem.name}.` : 'Fill in the details for the new menu item.'}
                  </DialogDescription>
                </DialogHeader>
                {isLoadingCategories ? (
                    <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading categories...</p></div>
                ) : managedCategories.length === 0 ? (
                    <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded-md">
                        <AlertTriangle className="inline mr-2"/> No categories found. Please add categories in Admin Settings first.
                    </div>
                ) : (
                    <MenuItemForm
                    onSubmit={handleFormSubmit}
                    initialData={editingItem}
                    onCancel={() => { setIsFormOpen(false); setEditingItem(null); }}
                    managedCategories={managedCategories}
                    />
                )}
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-1/2 lg:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && menuItems.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Refreshing data...</p>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filteredItems.length > 0 ? filteredItems.map((item, index) => (
                <TableRow key={item.id || `fallback-${index}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{formatInr(item.price)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Switch
                        id={`avail-${item.id}`}
                        checked={item.availability}
                        onCheckedChange={() => toggleAvailability(item)}
                        aria-label={`Toggle availability for ${item.name}`}
                        disabled={isSubmitting}
                      />
                       <Label htmlFor={`avail-${item.id}`} className="text-xs text-muted-foreground">
                        {item.availability ? 'Available' : 'Unavailable'}
                       </Label>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        disabled={isSubmitting || isLoadingCategories || managedCategories.length === 0}
                        title={isLoadingCategories || managedCategories.length === 0 ? "Loading categories or no categories defined in settings" : "Edit Item"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)} disabled={isSubmitting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the menu item "{itemToDelete?.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                !isLoading && (
                  <TableRow key="no-items-row">
                    <TableCell colSpan={5} className="text-center h-24">
                      {searchTerm ? 'No menu items match your search.' : 'No menu items found. Add one to get started!'}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

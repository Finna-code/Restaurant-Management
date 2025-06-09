'use client';

// React hooks and type imports
import { useState, useEffect, type ComponentProps } from 'react';
import type { MenuItem as MenuItemType } from '@/lib/types';
import type { CategorySettingItem } from '@/models/Settings'; // Type for category settings

// UI components and icons
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

// Utility: Infer the exact onSubmit prop type from MenuItemForm component
type MenuItemFormOnSubmit = ComponentProps<typeof MenuItemForm>['onSubmit'];

export default function AdminMenuPage() {
  // State for menu items fetched from API
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  // State for categories available to the form
  const [managedCategories, setManagedCategories] = useState<CategorySettingItem[]>([]);
  // Loading states for data and categories
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  // Submission state to disable inputs during API calls
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Error message state
  const [error, setError] = useState<string | null>(null);
  // Search term for filtering items
  const [searchTerm, setSearchTerm] = useState('');
  // Control opening/closing of the item form dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Track which item is being edited
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  // Track which item is queued for deletion
  const [itemToDelete, setItemToDelete] = useState<MenuItemType | null>(null);

  const { toast } = useToast(); // Notification hook

  // Fetch menu items and category settings on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setIsLoadingCategories(true);
      setError(null);
      try {
        // Parallel fetch for items and settings
        const [itemsRes, settingsRes] = await Promise.all([
          fetch('/api/menu-items'),
          fetch('/api/settings')
        ]);

        // Handle menu items response
        if (!itemsRes.ok) {
          const errorData = await itemsRes.json().catch(() => ({ error: 'Failed to fetch menu items' }));
          throw new Error(errorData.error);
        }
        const itemsJson = await itemsRes.json();
        if (itemsJson.success) {
          setMenuItems(itemsJson.data);
        } else {
          throw new Error(itemsJson.error);
        }

        // Handle settings response for categories
        if (!settingsRes.ok) {
          console.warn('Failed to fetch settings');
          setManagedCategories([]);
        } else {
          const settingsJson = await settingsRes.json();
          setManagedCategories(settingsJson.data?.managedCategories ?? []);
        }
      } catch (e: any) {
        // Capture and toast error
        setError(e.message);
        toast({ variant: 'destructive', title: 'Error', description: e.message });
      } finally {
        // Reset loading states
        setIsLoading(false);
        setIsLoadingCategories(false);
      }
    }

    fetchData();
  }, [toast]);

  /**
   * Handle form submission for create/update menu items.
   * Uses inferred type to ensure correct shape of `data`.
   */
  const handleFormSubmit: MenuItemFormOnSubmit = async (data) => {
    setIsSubmitting(true);
    const isEditing = Boolean(editingItem);
    const url = isEditing ? `/api/menu-items/${editingItem!.id}` : '/api/menu-items';
    const method = isEditing ? 'PUT' : 'POST';

    // Convert ingredient objects to string array for API
    const payload = { ...data, ingredients: data.ingredients.map(i => i.value) };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...payload, id: undefined } : payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error);

      // Update state based on create or edit
      const savedItem = result.data as MenuItemType;
      if (isEditing) {
        // Replace edited item
        setMenuItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        toast({ title: 'Updated', description: `${savedItem.name} was updated.` });
      } else {
        // Prepend new item
        setMenuItems(prev => [savedItem, ...prev]);
        toast({ title: 'Added', description: `${savedItem.name} was added.` });
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (e: any) {
      console.error('Form error:', e);
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified handlers for edit, delete confirmation, and availability toggle omitted for brevity

  // Render loading skeleton if initial load
  if (isLoading && !menuItems.length) return <Skeleton />;
  // Render error if no items loaded
  if (error && !menuItems.length) return (<div><AlertTriangle />{error}</div>);

  return (
    <div className="space-y-6">
      {/* Card header with add-item dialog */}
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Manage your menu items</CardDescription>
            </div>
            {/* Dialog trigger button */}
            <Dialog open={isFormOpen} onOpenChange={open => { setIsFormOpen(open); if (!open) setEditingItem(null); }}>
              <DialogTrigger asChild>
                <Button disabled={!managedCategories.length}>
                  <PlusCircle /> Add New Item
                </Button>
              </DialogTrigger>
              {/* Form content rendered here via MenuItemForm */}
              <DialogContent>
                <MenuItemForm
                  onSubmit={handleFormSubmit}
                  initialData={editingItem}
                  onCancel={() => setIsFormOpen(false)}
                  managedCategories={managedCategories}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        {/* Search input */}
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search items..."
            />
          </div>
        </CardContent>
      </Card>
      {/* Table of menu items */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.filter(item => item.name.includes(searchTerm)).map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right">{formatInr(item.price)}</TableCell>
              <TableCell>
                {/* Edit and Delete buttons with appropriate handlers */}
                <Button onClick={() => { setEditingItem(item); setIsFormOpen(true); }}>
                  <Edit />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button onClick={() => setItemToDelete(item)}><Trash2 /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

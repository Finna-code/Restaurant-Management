
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertTriangle, Save, PlusCircle, Trash2, Code } from "lucide-react";
import type { RestaurantSettingsType as FullRestaurantSettingsType, CategorySettingItem as ApiCategorySettingItem } from "@/models/Settings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Frontend form state type, now including managedCategories and usePlaceholderData
type SettingsFormState = Omit<FullRestaurantSettingsType, '_id' | 'createdAt' | 'updatedAt' | 'managedCategories' | keyof Document > & {
  id?: string;
  managedCategories: ApiCategorySettingItem[];
  usePlaceholderData: boolean; // Added
};


const initialFormState: SettingsFormState = {
  restaurantName: "EatKwik Central Kitchen",
  restaurantAddress: "123 Food Street, Flavor Town",
  restaurantContact: "555-123-4567",
  acceptingOnlineOrders: true,
  deliveryRadius: 5,
  minOrderValue: 800,
  managedCategories: [],
  usePlaceholderData: true, // Added
};

function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-9 w-1/3" /> {/* Page Title Skeleton */}

      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" /> {/* CardTitle Skeleton */}
          <Skeleton className="h-4 w-3/4" /> {/* CardDescription Skeleton */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <Skeleton className="h-10 w-40 mt-2" /> {/* Button Skeleton */}
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex-grow space-y-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-2/3" /></div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
          <div className="space-y-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
          <Skeleton className="h-10 w-44 mt-2" /> {/* Button Skeleton */}
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" /> {/* CardTitle */}
          <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-grow" /> {/* New Category Input */}
            <Skeleton className="h-10 w-28" /> {/* Add Button */}
          </div>
          <div className="space-y-2 pt-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <Skeleton className="h-5 w-1/3" /> {/* Category Name */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-11 rounded-full" /> {/* Switch */}
                  <Skeleton className="h-6 w-6 rounded-sm" /> {/* Delete Button */}
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-48 mt-2" /> {/* Save Categories Button */}
        </CardContent>
      </Card>

       <Separator />
       <Card className="shadow-lg"> {/* Developer Settings Skeleton */}
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex-grow space-y-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-2/3" /></div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
           <Skeleton className="h-10 w-48" /> {/* Save Dev Settings Button */}
        </CardContent>
      </Card>

       <Separator />
       <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}


export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingOps, setIsSavingOps] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isSavingDev, setIsSavingDev] = useState(false); // For dev settings
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<ApiCategorySettingItem | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({error: 'Failed to fetch settings data.'}));
        throw new Error(errorData.error || 'Failed to fetch settings');
      }
      const result = await res.json();
      if (result.success && result.data) {
        setSettings({
            ...initialFormState, // Start with defaults
            ...result.data,       // Override with fetched data
            managedCategories: result.data.managedCategories || [],
            usePlaceholderData: result.data.usePlaceholderData === undefined ? true : result.data.usePlaceholderData, // Ensure it's always boolean
        });
      } else {
        throw new Error(result.error || 'Could not load settings data.');
      }
    } catch (e: any) {
      setError(e.message);
      toast({ variant: "destructive", title: "Error Loading Settings", description: e.message });
      setSettings(initialFormState); // Fallback to initial state on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = e.target.type === 'number'
        ? (value === '' ? '' : parseFloat(value))
        : value;
    setSettings(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleGenericSwitchChange = (name: keyof SettingsFormState, checked: boolean) => {
     setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async (settingsDataToSave: Partial<SettingsFormState>, savingSetter: React.Dispatch<React.SetStateAction<boolean>>, sectionName: string) => {
    savingSetter(true);

    const payload = { ...settingsDataToSave };
    if (payload.deliveryRadius === '' || typeof payload.deliveryRadius === 'string') {
        payload.deliveryRadius = parseFloat(String(payload.deliveryRadius)) || 0;
    }
    if (payload.minOrderValue === '' || typeof payload.minOrderValue === 'string') {
        payload.minOrderValue = parseFloat(String(payload.minOrderValue)) || 0;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to save ${sectionName.toLowerCase()} settings`);
      }
      setSettings(prev => ({
          ...prev,
          ...result.data,
          managedCategories: result.data.managedCategories || prev.managedCategories,
          usePlaceholderData: result.data.usePlaceholderData === undefined ? prev.usePlaceholderData : result.data.usePlaceholderData,
      }));
      toast({ title: "Settings Saved!", description: `${sectionName} settings updated successfully.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: `Error Saving ${sectionName}`, description: e.message });
    } finally {
      savingSetter(false);
    }
  };

  const handleSaveRestaurantInfo = () => {
    const { restaurantName, restaurantAddress, restaurantContact } = settings;
    handleSave({ restaurantName, restaurantAddress, restaurantContact }, setIsSavingInfo, "Restaurant Information");
  };

  const handleSaveOperationalSettings = () => {
    const { acceptingOnlineOrders, deliveryRadius, minOrderValue } = settings;
    handleSave({ acceptingOnlineOrders, deliveryRadius, minOrderValue }, setIsSavingOps, "Operational");
  };
  
  const handleSaveDeveloperSettings = () => {
    const { usePlaceholderData } = settings;
    handleSave({ usePlaceholderData }, setIsSavingDev, "Developer");
  };

  const handleAddNewCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast({ variant: "destructive", title: "Error", description: "Category name cannot be empty." });
      return;
    }
    if (settings.managedCategories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({ variant: "destructive", title: "Error", description: "Category name already exists." });
      return;
    }
    setSettings(prev => ({
      ...prev,
      managedCategories: [...prev.managedCategories, { name: trimmedName, isDefault: false, isVisible: true, isCustom: true }]
    }));
    setNewCategoryName('');
    toast({ title: "Category Added (Locally)", description: `"${trimmedName}" added. Remember to save your category configuration.`});
  };

  const handleToggleCategoryVisibility = (categoryName: string, newVisibility: boolean) => {
    setSettings(prev => ({
      ...prev,
      managedCategories: prev.managedCategories.map(cat =>
        cat.name === categoryName ? { ...cat, isVisible: newVisibility } : cat
      )
    }));
    toast({
      title: "Visibility Changed (Locally)",
      description: `Visibility for "${categoryName}" ${newVisibility ? 'enabled' : 'disabled'}. Remember to save your category configuration.`
    });
  };

  const handleDeleteCategory = (categoryName: string) => {
    const category = settings.managedCategories.find(c => c.name === categoryName);
    if (category && category.isCustom) {
      setCategoryToDelete(category);
    } else if (category && !category.isCustom) {
        toast({variant: "destructive", title: "Cannot Delete", description: "Default categories cannot be deleted, only hidden."})
    }
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    setSettings(prev => ({
      ...prev,
      managedCategories: prev.managedCategories.filter(cat => cat.name !== categoryToDelete.name)
    }));
    toast({ title: "Category Removed (Locally)", description: `"${categoryToDelete.name}" removed. Remember to save your category configuration.`});
    setCategoryToDelete(null);
  };

  const handleSaveCategoryConfiguration = () => {
    handleSave({ managedCategories: settings.managedCategories }, setIsSavingCategories, "Category Configuration");
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-headline font-bold">Admin Settings</h1>

      {error && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/> Error Loading Settings</CardTitle>
                <CardDescription className="text-destructive/80">
                    There was an issue fetching the current settings: {error}. Displaying default values. You can still attempt to save changes.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Restaurant Information</CardTitle>
          <CardDescription>Update your restaurant's basic details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input id="restaurantName" name="restaurantName" value={settings.restaurantName} onChange={handleInputChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="restaurantAddress">Address</Label>
            <Input id="restaurantAddress" name="restaurantAddress" value={settings.restaurantAddress} onChange={handleInputChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="restaurantContact">Contact Phone</Label>
            <Input id="restaurantContact" name="restaurantContact" type="tel" value={settings.restaurantContact} onChange={handleInputChange} />
          </div>
          <Button onClick={handleSaveRestaurantInfo} disabled={isSavingInfo || isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSavingInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Restaurant Info
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Operational Settings</CardTitle>
          <CardDescription>Manage opening hours, delivery options, and order limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card/50">
            <div className="space-y-0.5">
                <Label htmlFor="acceptingOnlineOrders" className="text-base">Accepting Online Orders</Label>
                <p className="text-sm text-muted-foreground">
                    Toggle to enable or disable online ordering for customers.
                </p>
            </div>
            <Switch
              id="acceptingOnlineOrders"
              name="acceptingOnlineOrders"
              checked={settings.acceptingOnlineOrders}
              onCheckedChange={(checked) => handleGenericSwitchChange('acceptingOnlineOrders', checked)}
              disabled={isLoading}
            />
          </div>
           <div className="space-y-1">
            <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
            <Input id="deliveryRadius" name="deliveryRadius" type="number" value={settings.deliveryRadius === '' ? '' : Number(settings.deliveryRadius)} onChange={handleInputChange} placeholder="e.g., 5" disabled={isLoading} />
          </div>
           <div className="space-y-1">
            <Label htmlFor="minOrderValue">Minimum Order Value (INR)</Label>
            <Input id="minOrderValue" name="minOrderValue" type="number" value={settings.minOrderValue === '' ? '' : Number(settings.minOrderValue)} onChange={handleInputChange} placeholder="e.g., 500" disabled={isLoading} />
          </div>
          <Button onClick={handleSaveOperationalSettings} disabled={isSavingOps || isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSavingOps ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Operational Settings
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Category Management</CardTitle>
          <CardDescription>Configure default and custom menu categories. Changes here are local until saved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="newCategoryName">Add New Custom Category</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Specials, Vegan Options"
                disabled={isSavingCategories || isLoading}
              />
              <Button onClick={handleAddNewCategory} disabled={isSavingCategories || isLoading || !newCategoryName.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </div>

          {settings.managedCategories && settings.managedCategories.length > 0 && (
            <div className="space-y-3">
              <Label>Existing Categories</Label>
              {settings.managedCategories.map(cat => (
                <div key={cat.name} className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card/50">
                  <span className={`text-sm ${!cat.isVisible ? 'line-through text-muted-foreground' : ''}`}>
                    {cat.name} {cat.isDefault && <span className="text-xs text-muted-foreground">(Default)</span>}
                  </span>
                  <div className="flex items-center space-x-2">
                    {cat.isDefault ? (
                      <Switch
                        checked={cat.isVisible}
                        onCheckedChange={(checked) => handleToggleCategoryVisibility(cat.name, checked)}
                        aria-label={`Toggle visibility for ${cat.name}`}
                        disabled={isSavingCategories || isLoading}
                      />
                    ) : ( 
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.name)} disabled={isSavingCategories || isLoading} className="text-destructive hover:text-destructive/90">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {cat.name}</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
           {settings.managedCategories && settings.managedCategories.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">No categories configured yet. Default categories will be added on first save if not present.</p>
          )}

          <Button onClick={handleSaveCategoryConfiguration} disabled={isSavingCategories || isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSavingCategories ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Category Configuration
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Code className="mr-2 h-5 w-5"/>Developer Settings</CardTitle>
          <CardDescription>Manage development-specific configurations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card/50">
            <div className="space-y-0.5">
                <Label htmlFor="usePlaceholderData" className="text-base">Use Placeholder Dashboard Data</Label>
                <p className="text-sm text-muted-foreground">
                    When enabled, the admin dashboard will display sample data instead of live database data.
                </p>
            </div>
            <Switch
              id="usePlaceholderData"
              name="usePlaceholderData"
              checked={settings.usePlaceholderData}
              onCheckedChange={(checked) => handleGenericSwitchChange('usePlaceholderData', checked)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSaveDeveloperSettings} disabled={isSavingDev || isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {isSavingDev ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Developer Settings
          </Button>
        </CardContent>
      </Card>


      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Staff Management</CardTitle>
          <CardDescription>Manage staff accounts and permissions (Placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Staff management features are planned for future updates. This section will allow inviting new staff, assigning roles (e.g., 'chef', 'cashier', 'delivery_driver'), and managing access levels to different parts of the admin panel.</p>
          <Button variant="outline" onClick={() => toast({title: "Feature Not Implemented", description: "Staff management functionality is coming soon!"})}>
            Manage Staff (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the custom category "{categoryToDelete?.name}". This action will only be permanent after you click "Save Category Configuration".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive hover:bg-destructive/90">Delete Locally</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

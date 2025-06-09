
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MenuItem, DietaryTag } from '@/lib/types';
import type { CategorySettingItem } from '@/models/Settings';
import { DIETARY_TAGS } from '@/lib/types';
import { PlusCircle, Trash2, UploadCloud } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const menuItemFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  category: z.string().min(1, { message: "Please select a category."}), // Changed from custom to string
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  ingredients: z.array(z.object({ value: z.string().min(1, {message: "Ingredient cannot be empty."}) })).min(1, {message: "At least one ingredient is required."}),
  tags: z.array(z.custom<DietaryTag>()).optional(),
  availability: z.boolean().default(true),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  prepTime: z.coerce.number().int().min(0, {message: "Prep time cannot be negative."}).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  onSubmit: (data: MenuItemFormValues & { id?: string }) => void;
  initialData?: MenuItem | null;
  onCancel?: () => void;
  managedCategories: CategorySettingItem[]; // Now expects managed categories
}

export function MenuItemForm({ onSubmit, initialData, onCancel, managedCategories }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          ingredients: initialData.ingredients.map(ing => ({ value: ing })),
          tags: initialData.tags as DietaryTag[],
          category: initialData.category, // Ensure initialData.category is a string name
        }
      : {
          name: '',
          category: managedCategories.length > 0 ? managedCategories[0].name : '', // Default to first managed category or empty
          price: 0,
          description: '',
          ingredients: [{ value: '' }],
          tags: [],
          availability: true,
          imageUrl: '',
          prepTime: 0,
        },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients"
  });

  const handleSubmit = (values: MenuItemFormValues) => {
    onSubmit({ ...values, id: initialData?.id });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Margherita Pizza" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                    {managedCategories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (INR)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="999.00" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="A classic Italian pizza..." {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Ingredients</FormLabel>
          {ingredientFields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`ingredients.${index}.value`}
              render={({ field: itemField }) => (
                <FormItem className="flex items-center space-x-2 mt-1">
                  <FormControl><Input placeholder={`Ingredient ${index + 1}`} {...itemField} /></FormControl>
                  {ingredientFields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                  <FormMessage/>
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ value: '' })} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
          </Button>
           {form.formState.errors.ingredients && !form.formState.errors.ingredients.root?.message && typeof form.formState.errors.ingredients.message === 'string' && (
              <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.ingredients.message}</p>
           )}
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Dietary Tags</FormLabel>
              <FormDescription>Select applicable tags.</FormDescription>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {DIETARY_TAGS.map((tag) => (
                  <FormField
                    key={tag}
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(tag)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), tag])
                                : field.onChange(field.value?.filter((value) => value !== tag));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{tag}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
              <FormDescription className="flex items-center gap-1 text-xs">
                <UploadCloud className="h-3 w-3"/> Or leave blank for a placeholder.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prepTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preparation Time (minutes)</FormLabel>
              <FormControl><Input type="number" placeholder="15" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Available</FormLabel>
                <FormDescription>Is this item currently available for order?</FormDescription>
              </div>
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
        </div>
        </ScrollArea>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {initialData ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

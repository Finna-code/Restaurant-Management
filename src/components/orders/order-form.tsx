
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Order, OrderItem, OrderStatus, MenuItem } from '@/lib/types';
import { ORDER_STATUSES } from '@/lib/types';
import { PlusCircle, Trash2, ShoppingCart } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { formatInr } from '@/lib/currency-utils';


// Simplified MenuItem for form selection
type SelectableMenuItem = Pick<MenuItem, 'id' | 'name' | 'price'>;

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Please select an item."),
  name: z.string(), // Will be auto-filled
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  priceAtOrder: z.coerce.number(), // Will be auto-filled
  customizations: z.string().optional(),
});

const orderFormSchema = z.object({
  customerName: z.string().min(2, "Customer name is required."),
  customerContact: z.string().min(5, "Customer contact (phone/email) is required."), // Basic validation
  status: z.custom<OrderStatus>(val => ORDER_STATUSES.includes(val as OrderStatus), { message: "Please select a valid status."}),
  notes: z.string().optional(),
  deliveryAddress: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required in the order."),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSubmit: (data: OrderFormValues & { id?: string, orderNumber?: string, createdAt?: string, updatedAt?: string, totalAmount: number }) => void;
  initialData?: Order | null;
  menuItems: SelectableMenuItem[]; // Available menu items for selection
  onCancel?: () => void;
}

export function OrderForm({ onSubmit, initialData, menuItems, onCancel }: OrderFormProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          items: initialData.items.map(item => ({...item})), // ensure new objects for field array
        }
      : {
          customerName: '',
          customerContact: '',
          status: 'Placed',
          notes: '',
          deliveryAddress: '',
          items: [{ menuItemId: '', name: '', quantity: 1, priceAtOrder: 0, customizations: '' }],
        },
  });

  const { fields: orderItemFields, append: appendOrderItem, remove: removeOrderItem, update } = useFieldArray({
    control: form.control,
    name: "items"
  });
  
  const watchItems = form.watch("items");

  const calculateTotalAmount = () => {
    return watchItems.reduce((total, item) => total + (item.quantity * item.priceAtOrder), 0);
  };


  const handleMenuItemChange = (index: number, menuItemId: string) => {
    const selectedItem = menuItems.find(mi => mi.id === menuItemId);
    if (selectedItem) {
      // Get the current item's state for quantity and customizations
      // as update will replace the whole item object at that index.
      const currentItemState = watchItems[index];
      update(index, {
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        quantity: currentItemState.quantity, // Preserve quantity
        priceAtOrder: selectedItem.price,
        customizations: currentItemState.customizations, // Preserve customizations
      });
    }
  };

  const handleSubmit = (values: OrderFormValues) => {
    const totalAmount = calculateTotalAmount();
    const submissionData = {
      ...values,
      id: initialData?.id,
      orderNumber: initialData?.orderNumber,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalAmount,
    };
    onSubmit(submissionData);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            {/* Customer Info Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="font-headline text-lg">Customer Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="customerContact" render={({ field }) => (
                      <FormItem><FormLabel>Contact (Phone/Email)</FormLabel><FormControl><Input placeholder="john.doe@example.com or 555-1234" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                      <FormItem><FormLabel>Delivery Address (Optional)</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown" {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-headline text-lg">Order Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>{ORDER_STATUSES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem><FormLabel>Special Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., allergies, delivery instructions" {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </CardContent>
              </Card>
            </div>

            {/* Items Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="font-headline text-lg flex items-center"><ShoppingCart className="mr-2 h-5 w-5"/>Order Items</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {orderItemFields.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-md space-y-3 bg-card">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">Item {index + 1}</p>
                        {orderItemFields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeOrderItem(index)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                       <FormField control={form.control} name={`items.${index}.menuItemId`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Menu Item</FormLabel>
                            <Select 
                              onValueChange={(value) => handleMenuItemChange(index, value)} 
                              value={itemField.value || ''}
                            >
                              <FormControl><SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger></FormControl>
                              <SelectContent>{menuItems.map(mi => (<SelectItem key={mi.id} value={mi.id}>{mi.name} ({formatInr(mi.price)})</SelectItem>))}</SelectContent>
                            </Select><FormMessage />
                          </FormItem>
                       )}/>
                       <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...itemField} /></FormControl><FormMessage /></FormItem>
                       )}/>
                       <FormField control={form.control} name={`items.${index}.customizations`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Customizations (Optional)</FormLabel><FormControl><Input placeholder="e.g., extra cheese" {...itemField} /></FormControl><FormMessage /></FormItem>
                       )}/>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendOrderItem({ menuItemId: '', name: '', quantity: 1, priceAtOrder: 0, customizations: '' })} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                  </Button>
                   {form.formState.errors.items && !form.formState.errors.items.root?.message && (
                      <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.items.message}</p>
                   )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-headline text-lg">Order Total</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-primary">{formatInr(calculateTotalAmount())}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <Separator />
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {initialData ? 'Save Changes' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

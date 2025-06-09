
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, useFieldArray, Controller, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { MenuItem, OrderItem as OrderItemType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, Package, User, CreditCard, CheckCircle, ShoppingBag, ShoppingCart, ArrowLeft, ArrowRight, RotateCcw, Check } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { formatInr } from '@/lib/currency-utils';

// Schema for individual order items
const orderItemSchema = z.object({
  menuItemId: z.string(), // Can be empty initially, validation in superRefine for step 3
  name: z.string(), // Auto-filled based on menuItemId
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  priceAtOrder: z.coerce.number(), // Auto-filled based on menuItemId
  customizations: z.string().optional(),
});

// Master schema definition using superRefine for step-based validation
const createMasterSchema = (currentStep: number) => z.object({
  orderType: z.enum(['Takeout', 'Delivery'], { required_error: "Please select an order type."}),
  customerName: z.string().min(2, 'Name must be at least 2 characters.'),
  customerContact: z.string().min(5, 'Contact information is required (min 5 chars).'),
  deliveryAddress: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item.'),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (currentStep >= 1) {
    if (!data.orderType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['orderType'], message: 'Please select an order type.' });
    }
  }
  if (currentStep >= 2) {
    if (!data.customerName || data.customerName.length < 2) {
       ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerName'], message: 'Name must be at least 2 characters.' });
    }
    if (!data.customerContact || data.customerContact.length < 5) {
       ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerContact'], message: 'Contact information is required (min 5 chars).' });
    }
    if (data.orderType === 'Delivery' && (!data.deliveryAddress || data.deliveryAddress.length < 5)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['deliveryAddress'], message: 'Delivery address is required for delivery (min 5 chars).' });
    }
  }
  if (currentStep >= 3) {
    // Refined validation for items in Step 3
    if (!data.items || data.items.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Order must contain at least one item.'});
    } else {
      data.items.forEach((item, index) => {
        if (!item.menuItemId || item.menuItemId.length === 0) { // Check if menuItemId is empty or not selected
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [`items.${index}.menuItemId`], message: 'Item selection is required.' });
        }
        // Quantity validation is handled by individual orderItemSchema
        // No need for specific quantity validation here if it's already in orderItemSchema and RHF uses that.
      });
    }
  }
});


export type MultiStepOrderFormValues = z.infer<ReturnType<typeof createMasterSchema>>;

interface MultiStepOrderFormProps {
  menuItems: Pick<MenuItem, 'id' | 'name' | 'price'>[];
  onSubmit: (data: MultiStepOrderFormValues) => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 4;

export function MultiStepOrderForm({ menuItems, onSubmit, onCancel }: MultiStepOrderFormProps) {
  console.log("menuItems (in MultiStepOrderForm):", menuItems); // Item 2 log
  const [currentStep, setCurrentStep] = useState(1);

  const masterSchema = useMemo(() => createMasterSchema(currentStep), [currentStep]);

  const form = useForm<MultiStepOrderFormValues>({
    resolver: zodResolver(masterSchema),
    mode: 'onChange',
    defaultValues: {
      orderType: undefined,
      customerName: '',
      customerContact: '',
      deliveryAddress: '',
      items: [{ menuItemId: '', name: '', quantity: 1, priceAtOrder: 0, customizations: '' }],
      notes: '',
    },
  });

  const watchedItemsArray = useWatch({ control: form.control, name: 'items' });
  const watchOrderType = form.watch('orderType');

  const { fields: itemFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (form.getValues('items').length === 0 && menuItems.length > 0) {
        append({ menuItemId: '', name: '', quantity: 1, priceAtOrder: 0, customizations: '' });
    }
  }, [form, append, menuItems]);


  const handleNext = async () => {
    console.log("watchedItemsArray (before validation in handleNext):", watchedItemsArray); // Item 6 log
    let fieldsToValidate: (keyof MultiStepOrderFormValues)[] | undefined = undefined;
    if (currentStep === 1) {
      fieldsToValidate = ['orderType'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['customerName', 'customerContact'];
      if (form.getValues('orderType') === 'Delivery') {
        fieldsToValidate.push('deliveryAddress');
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ['items'];
    }

    const isValid = fieldsToValidate ? await form.trigger(fieldsToValidate) : true;

    if (isValid) {
      if (currentStep === 3) {
        // Additional check to ensure all appended items have a menuItemId selected
        const itemsValid = watchedItemsArray?.every(item => item.menuItemId && item.menuItemId.length > 0);
        if (!itemsValid || !watchedItemsArray || watchedItemsArray.length === 0) {
            form.setError("items", { type: "manual", message: "Please select a menu item for all entries. At least one item is required." });
            watchedItemsArray?.forEach((item, itemIndex) => {
                if (!item.menuItemId) {
                  form.setError(`items.${itemIndex}.menuItemId`, { type: "manual", message: "Item selection is required." });
                }
              });
            return; // Prevent proceeding if any item is not selected
        }
      }


      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFormSubmit = form.handleSubmit(data => {
    console.log("FORM DATA SUBMITTED:", data); // Item 4 log
    onSubmit(data);
  });

  const calculateTotal = (items: Partial<OrderItemType>[] | undefined) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.priceAtOrder || 0)), 0);
  };

  const currentTotal = useMemo(() => calculateTotal(watchedItemsArray), [watchedItemsArray]);

  const stepTitles: { [key: number]: string } = {
    1: 'Select Order Type',
    2: 'Your Contact Details',
    3: 'Choose Your Items',
    4: 'Review Your Order'
  };

  const stepDescriptions: { [key: number]: string } = {
    1: 'Will this be for takeout or delivery?',
    2: 'Please provide your name and contact information.',
    3: 'Add items from our menu to your order.',
    4: 'Please confirm all details are correct before placing the order.'
  };

  const renderStepIndicators = () => {
    return (
      <div className="flex items-center mb-8 px-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-in-out",
                    isCompleted ? "bg-green-500 text-white" :
                    isCurrent ? "bg-primary text-primary-foreground scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background" :
                    "bg-muted border-2 border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
              </div>
              {stepNumber < TOTAL_STEPS && (
                <div className={cn(
                    "flex-1 h-1 transition-all duration-300 ease-in-out mx-1",
                    stepNumber < currentStep ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-0 flex flex-col h-full max-h-[80vh] md:max-h-[75vh]">
        <div className="p-6 pb-2">
          {renderStepIndicators()}
        </div>
        <CardHeader className="flex-shrink-0 pt-2">
          <CardTitle className="font-headline text-xl">{stepTitles[currentStep] || `Step ${currentStep}`}</CardTitle>
          <CardDescription>{stepDescriptions[currentStep] || 'Complete this step to continue.'}</CardDescription>
        </CardHeader>

        <ScrollArea className="flex-grow">
          <CardContent className="min-h-[200px] px-6 py-4">
            {/* Step 1 Content */}
            <div className={cn(currentStep === 1 ? 'block' : 'hidden')}>
              <Controller
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Select Order Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md hover:border-primary flex-1 cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                          <FormControl><RadioGroupItem value="Takeout" id="takeout" /></FormControl>
                          <FormLabel htmlFor="takeout" className="font-normal text-base cursor-pointer flex items-center"><ShoppingBag className="mr-2 h-5 w-5"/>Takeout</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md hover:border-primary flex-1 cursor-pointer data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 transition-all">
                          <FormControl><RadioGroupItem value="Delivery" id="delivery" /></FormControl>
                          <FormLabel htmlFor="delivery" className="font-normal text-base cursor-pointer flex items-center"><Package className="mr-2 h-5 w-5"/>Delivery</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2 Content */}
            <div className={cn(currentStep === 2 ? 'block' : 'hidden')}>
              <div className="space-y-4">
                <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="customerContact" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number / Email</FormLabel><FormControl><Input placeholder="0123456789 or john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                {watchOrderType === 'Delivery' && (
                  <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                    <FormItem><FormLabel>Delivery Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, AT 12345" {...field} rows={3}/></FormControl><FormMessage /></FormItem>
                  )}/>
                )}
              </div>
            </div>

            {/* Step 3 Content */}
            <div className={cn(currentStep === 3 ? 'block' : 'hidden')}>
              <div className="space-y-6">
                {itemFields.map((item, index) => {
                  return (
                    <Card key={item.id} className="p-4 bg-card/50">
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-md font-semibold">Item {index + 1}</FormLabel>
                        {itemFields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/80 h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Controller
                          control={form.control}
                          name={`items.${index}.menuItemId`}
                          render={({ field: menuItemIdField }) => (
                            <FormItem>
                              <FormLabel>Menu Item</FormLabel>
                              <Select
                                value={menuItemIdField.value ? String(menuItemIdField.value) : ''}
                                onValueChange={(selectedValue) => {
                                  console.log(`Item ${index} - onValueChange - selectedValue:`, selectedValue);
                                  menuItemIdField.onChange(selectedValue);

                                  const itemPathPrefix = `items.${index}`;
                                  console.log(`Item ${index} - onValueChange - menuItems available to find:`, JSON.parse(JSON.stringify(menuItems)));
                                  const selectedItemData = menuItems.find(mi => String(mi.id) === String(selectedValue));
                                  console.log(`Item ${index} - onValueChange - selectedItemData found:`, JSON.parse(JSON.stringify(selectedItemData)));


                                  if (selectedItemData) {
                                    form.setValue(`${itemPathPrefix}.menuItemId`, String(selectedItemData.id), { shouldDirty: true, shouldTouch: true });
                                    form.setValue(`${itemPathPrefix}.name`, selectedItemData.name, { shouldDirty: true, shouldTouch: true });
                                    form.setValue(`${itemPathPrefix}.priceAtOrder`, selectedItemData.price, { shouldDirty: true, shouldTouch: true });
                                  } else {
                                     console.warn(`Item ${index} - onValueChange - No selectedItemData found for selectedValue:`, selectedValue);
                                    form.setValue(`${itemPathPrefix}.menuItemId`, '', { shouldDirty: true, shouldTouch: true });
                                    form.setValue(`${itemPathPrefix}.name`, '', { shouldDirty: true, shouldTouch: true });
                                    form.setValue(`${itemPathPrefix}.priceAtOrder`, 0, { shouldDirty: true, shouldTouch: true });
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    {(() => {
                                      console.log(`menuItemIdField.value (Item ${index} in SelectTrigger):`, menuItemIdField.value); // Item 1 log
                                      const selectedItemId = menuItemIdField.value;
                                      if (selectedItemId) {
                                        const itemDetails = menuItems.find(mi => String(mi.id) === String(selectedItemId));
                                        if (itemDetails) {
                                          return `${itemDetails.name} (${formatInr(itemDetails.price)})`;
                                        }
                                      }
                                      return <SelectValue placeholder="Select an item" />;
                                    })()}
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {menuItems.map(mi => (
                                    <SelectItem key={String(mi.id)} value={String(mi.id)}>
                                      {mi.name} ({formatInr(mi.price)})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field: quantityField }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl><Input type="number" min="1" {...quantityField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.customizations`}
                          render={({ field: customizationsField }) => (
                            <FormItem>
                              <FormLabel>Customizations (Optional)</FormLabel>
                              <FormControl><Input placeholder="e.g., extra cheese" {...customizationsField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ menuItemId: '', name: '', quantity: 1, priceAtOrder: 0, customizations: '' })}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                </Button>
                 {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (form.formState.errors.items as any).message && (
                  <p className="text-sm font-medium text-destructive">{(form.formState.errors.items as any).message}</p>
                 )}
                <Separator />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Order Notes (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., dietary restrictions for entire order, specific delivery instructions" {...field} rows={3}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="text-right">
                  <p className="text-lg font-semibold">Total: <span className="text-primary">{formatInr(currentTotal)}</span></p>
                </div>
              </div>
            </div>

            {/* Step 4 Content */}
            <div className={cn(currentStep === 4 ? 'block' : 'hidden')}>
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="font-headline text-lg flex items-center"><Package className="mr-2 h-5 w-5 text-muted-foreground"/>Order Type</CardTitle></CardHeader>
                  <CardContent><p className="text-md">{form.getValues('orderType')}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="font-headline text-lg flex items-center"><User className="mr-2 h-5 w-5 text-muted-foreground"/>Personal Details</CardTitle></CardHeader>
                  <CardContent className="space-y-1">
                    <p><strong>Name:</strong> {form.getValues('customerName')}</p>
                    <p><strong>Contact:</strong> {form.getValues('customerContact')}</p>
                    {form.getValues('orderType') === 'Delivery' && form.getValues('deliveryAddress') && (
                      <p><strong>Address:</strong> {form.getValues('deliveryAddress')}</p>
                    )}
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle className="font-headline text-lg flex items-center"><ShoppingCart className="mr-2 h-5 w-5 text-muted-foreground"/>Order Items</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {(watchedItemsArray || form.getValues('items'))?.map((item, index) => (
                      <div key={index} className="p-3 border rounded-md bg-background/50">
                        <div className="flex justify-between items-start">
                            <p className="font-medium">{item.name || 'Item not selected'} <span className="text-sm text-muted-foreground">({item.quantity}x)</span></p>
                            <p className="font-medium text-primary">{formatInr((item.quantity || 0) * (item.priceAtOrder || 0))}</p>
                        </div>
                        {item.customizations && <p className="text-xs text-muted-foreground italic">Customizations: {item.customizations}</p>}
                      </div>
                    ))}
                     {form.getValues('notes') && (
                        <div className="pt-2">
                            <p className="font-semibold text-sm">General Notes:</p>
                            <p className="text-sm text-muted-foreground italic">{form.getValues('notes')}</p>
                        </div>
                    )}
                    <Separator className="my-3"/>
                    <div className="text-right">
                      <p className="text-xl font-bold">Total: <span className="text-primary">{formatInr(currentTotal)}</span></p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </ScrollArea>

        <CardFooter className="flex justify-between pt-6 border-t mt-auto flex-shrink-0">
          {currentStep === 1 ? (
             <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4"/>Back</Button>
          )}

          {currentStep < 3 && (
            <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">Next<ArrowRight className="ml-2 h-4 w-4"/></Button>
          )}
          {currentStep === 3 && (
             <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">Review Order<RotateCcw className="ml-2 h-4 w-4"/></Button>
          )}
          {currentStep === TOTAL_STEPS && (
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <CheckCircle className="mr-2 h-4 w-4" /> Place Order
            </Button>
          )}
        </CardFooter>
      </form>
    </FormProvider>
  );
}

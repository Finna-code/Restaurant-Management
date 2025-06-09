
'use client';

import { useState, useEffect } from 'react';
import type { Order as OrderType, OrderStatus, MenuItem as MenuItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertTriangle, Eye, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ORDER_STATUSES } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OrderForm } from '@/components/orders/order-form';
import { MultiStepOrderForm, type MultiStepOrderFormValues } from '@/components/orders/multi-step-order-form';
import { formatInr } from '@/lib/currency-utils';

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Placed': return 'secondary';
    case 'In Preparation': return 'default';
    case 'Ready for Pickup':
    case 'Out for Delivery': return 'outline';
    case 'Delivered': return 'default';
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusBadgeClassName = (status: OrderStatus): string => {
  switch (status) {
    case 'In Preparation': return 'bg-blue-500 text-white';
    case 'Ready for Pickup': return 'bg-yellow-500 text-black';
    case 'Out for Delivery': return 'bg-orange-500 text-white';
    case 'Delivered': return 'bg-green-500 text-white';
    default: return '';
  }
}

function AdminOrdersPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <Skeleton className="h-7 w-1/2 mb-1" /> {/* CardTitle */}
              <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
            </div>
            <Skeleton className="h-10 w-32 mt-4 sm:mt-0" /> {/* New Order Button */}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            {/* Adjusted search input skeleton width to be like menu page */}
            <Skeleton className="h-10 w-full sm:w-1/2 lg:w-1/3" /> {/* Search Input Skeleton */}
            {/* Adjusted status filter skeleton width */}
            <Skeleton className="h-10 w-full sm:w-auto sm:min-w-[200px] sm:max-w-[200px]" /> {/* Status Filter Select Skeleton */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {Array(6).fill(0).map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-full min-w-[60px] max-w-[120px]" /></TableHead> // More responsive headers
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, rowIndex) => (
                <TableRow key={rowIndex}><TableCell><Skeleton className="h-5 w-16"/></TableCell><TableCell>
                  <Skeleton className="h-5 w-24 mb-1"/><Skeleton className="h-3 w-20"/>
                </TableCell><TableCell><Skeleton className="h-5 w-28"/></TableCell><TableCell className="text-right">
                  <Skeleton className="h-5 w-12 ml-auto"/>
                </TableCell><TableCell><Skeleton className="h-8 w-full max-w-[150px] rounded-md"/></TableCell><TableCell className="text-right space-x-1">
                  <Skeleton className="h-8 w-8 inline-block"/><Skeleton className="h-8 w-8 inline-block"/><Skeleton className="h-8 w-8 inline-block"/>
                </TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [availableMenuItems, setAvailableMenuItems] = useState<Pick<MenuItemType, 'id' | 'name' | 'price'>[]>([]);
  const [isLoading, setIsLoading] = useState(true); // General loading for the page
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(true); // Specific for menu items loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderType | null>(null);
  const [isMultiStepFormOpen, setIsMultiStepFormOpen] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // For overall page skeleton
      setIsLoadingMenuItems(true); // Specifically for menu items
      setError(null);
      try {
        const [ordersRes, menuItemsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/menu-items') 
        ]);

        if (!ordersRes.ok) {
          const errorData = await ordersRes.json().catch(() => ({ error: 'Failed to fetch orders' }));
          throw new Error(errorData.error || `HTTP error! status: ${ordersRes.status}`);
        }
        const ordersJson = await ordersRes.json();
        if (ordersJson.success) {
          setOrders(ordersJson.data);
        } else {
          throw new Error(ordersJson.error || 'Failed to load orders from API.');
        }

        if (!menuItemsRes.ok) {
          console.warn('Failed to fetch menu items for OrderForm');
           setAvailableMenuItems([]);
           throw new Error('Failed to fetch menu items, cannot create new orders currently.');
        } else {
          const menuItemsJson = await menuItemsRes.json();
          if (menuItemsJson.success) {
            setAvailableMenuItems(menuItemsJson.data.map((item: MenuItemType) => ({
              id: item.id,
              name: item.name,
              price: item.price
            })));
          } else {
            console.warn('Menu items API call not successful:', menuItemsJson.error);
            setAvailableMenuItems([]);
            throw new Error(menuItemsJson.error || 'Menu items API call not successful, cannot create new orders.');
          }
        }
      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
        console.error(e);
        toast({ variant: "destructive", title: "Error Loading Data", description: e.message });
      } finally {
        setIsLoading(false);
        setIsLoadingMenuItems(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update order status');
      }
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? result.data : order
        )
      );
      toast({ title: "Status Updated", description: `Order ${result.data.orderNumber} status changed to ${newStatus}.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFormSubmit = async (orderData: Omit<OrderType, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'> & { id?: string }) => {
    setIsSubmitting(true);
    if (!editingOrder || !editingOrder.id) {
        toast({ variant: "destructive", title: "Error", description: "No order selected for editing." });
        setIsSubmitting(false);
        return;
    }
    const endpoint = `/api/orders/${editingOrder.id}`;
    const method = 'PUT';

    const payload = { ...orderData };
    if (payload.id) delete payload.id;

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update order');
      }
      const savedOrder = result.data as OrderType;
      setOrders(prev => prev.map(o => o.id === savedOrder.id ? savedOrder : o));
      toast({ title: "Order Updated", description: `Order ${savedOrder.orderNumber} was successfully updated.`});
      setIsEditFormOpen(false);
      setEditingOrder(null);
    } catch (e: any) {
      console.error("Order form submission error:", e);
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultiStepFormSubmit = async (formData: MultiStepOrderFormValues) => {
    setIsSubmitting(true);
    const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.priceAtOrder, 0);
    const orderPayload = {
        customerName: formData.customerName,
        customerContact: formData.customerContact,
        deliveryAddress: formData.orderType === 'Delivery' ? formData.deliveryAddress : undefined,
        items: formData.items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            customizations: item.customizations,
        })),
        notes: formData.notes,
        status: 'Placed' as OrderStatus,
        totalAmount: totalAmount,
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to create order');
        }
        const newOrder = result.data as OrderType;
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        toast({ title: "Order Created!", description: `Order ${newOrder.orderNumber} has been successfully placed.` });
        setIsMultiStepFormOpen(false);
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error Creating Order", description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };


  const handleEditOrder = (order: OrderType) => {
    setEditingOrder(order);
    setIsEditFormOpen(true);
  };

  const handleDeleteOrderConfirm = async () => {
    if (!orderToDelete) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        throw new Error(errorResult?.error || 'Failed to delete order.');
      }
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderToDelete.id));
      toast({ title: "Order Deleted!", description: `Order ${orderToDelete.orderNumber} has been deleted.` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error Deleting", description: e.message });
    } finally {
      setOrderToDelete(null);
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (order.customerContact && order.customerContact.toLowerCase().includes(searchTerm.toLowerCase()))
    ) &&
    (statusFilter === 'all' || order.status === statusFilter)
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading && orders.length === 0) return <AdminOrdersPageSkeleton />;

  // If there was an error fetching initial data (orders or crucial menu items for new orders) and nothing is loaded
  if (error && orders.length === 0 && availableMenuItems.length === 0) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded-md animate-fade-in">
        <AlertTriangle className="inline mr-2"/>{error}
        <p className="text-sm">Please try refreshing the page. If the problem persists, contact support.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="font-headline text-2xl">Order Management</CardTitle>
                <CardDescription>View, update, and manage customer orders.</CardDescription>
              </div>
              <Button
                className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  if (isLoadingMenuItems) {
                    toast({ title: "Loading Menu Items", description: "Please wait until menu items are loaded to create a new order." });
                    return;
                  }
                  if (availableMenuItems.length === 0 && !isLoadingMenuItems) {
                     toast({ variant: "destructive", title: "Menu Items Unavailable", description: "Cannot create new orders as menu items could not be loaded." });
                     return;
                  }
                  setIsMultiStepFormOpen(true);
                  setEditingOrder(null);
                }}
                disabled={isLoadingMenuItems || (availableMenuItems.length === 0 && !isLoadingMenuItems)}
              >
                {isLoadingMenuItems ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                 New Order
              </Button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Order #, Name, Contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && orders.length > 0 && ( // Subtle loader if refetching orders but some are already displayed
             <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Refreshing order data...</p>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerContact}</div>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right">{formatInr(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(newStatus) => handleOrderStatusChange(order.id, newStatus as OrderStatus)} disabled={isSubmitting}>
                        <SelectTrigger className="h-8 text-xs w-[150px]">
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(order.status)} className={`text-xs ${getStatusBadgeClassName(order.status)}`}>
                              {order.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewingOrder(order)} disabled={isSubmitting}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)} disabled={isSubmitting || availableMenuItems.length === 0}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setOrderToDelete(order)} className="text-destructive hover:text-destructive/90" disabled={isSubmitting}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete order "{orderToDelete?.orderNumber}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteOrderConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (!isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No orders match your criteria.' 
                      : (error ? `Error fetching orders: ${error}` : 'No orders found. Create one to get started!')}
                  </TableCell>
                </TableRow>
              ) : null)}
            </TableBody>

          </Table>
        </CardContent>
      </Card>

      {editingOrder && (
        <Dialog open={isEditFormOpen && !!editingOrder} onOpenChange={(open) => { setIsEditFormOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-headline">Edit Order</DialogTitle>
              <DialogDescription>Modify details for order #{editingOrder.orderNumber}.</DialogDescription>
            </DialogHeader>
            {isLoadingMenuItems && <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/> Loading menu options...</div>}
            {!isLoadingMenuItems && availableMenuItems.length === 0 && <div className="p-4 text-center text-destructive">Menu items could not be loaded. Cannot edit order items.</div>}
            {!isLoadingMenuItems && availableMenuItems.length > 0 && (
                <OrderForm
                onSubmit={handleEditFormSubmit as any}
                initialData={editingOrder}
                menuItems={availableMenuItems}
                onCancel={() => {setIsEditFormOpen(false); setEditingOrder(null);}}
                />
            )}
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isMultiStepFormOpen} onOpenChange={setIsMultiStepFormOpen}>
        <DialogContent className="sm:max-w-2xl"> 
          <DialogHeader>
            <DialogTitle className="font-headline">Create New Order</DialogTitle>
          </DialogHeader>
          {/* MultiStepOrderForm expects menuItems, ensure they are loaded */}
          {isLoadingMenuItems && <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/> Loading menu options...</div>}
          {!isLoadingMenuItems && availableMenuItems.length === 0 && <div className="p-4 text-center text-destructive">Menu items could not be loaded. Please try again later.</div>}
          {!isLoadingMenuItems && availableMenuItems.length > 0 && (
            <MultiStepOrderForm
              menuItems={availableMenuItems}
              onSubmit={handleMultiStepFormSubmit}
              onCancel={() => setIsMultiStepFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {viewingOrder && (
        <OrderDetailsDialog order={viewingOrder} open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)} />
      )}
    </div>
  );
}


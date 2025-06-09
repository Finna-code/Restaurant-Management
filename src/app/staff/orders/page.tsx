
'use client';

import { useState, useEffect } from 'react';
import type { Order as OrderType, OrderStatus, MenuItem as MenuItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertTriangle, Eye, Edit, PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ORDER_STATUSES } from '@/lib/types';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OrderForm } from '@/components/orders/order-form';
// MultiStepOrderForm is not used by staff for creating new orders directly from this page.
// import { MultiStepOrderForm, type MultiStepOrderFormValues } from '@/components/orders/multi-step-order-form';


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

function StaffOrdersPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <Skeleton className="h-7 w-1/2 mb-1" /> {/* CardTitle */}
              <Skeleton className="h-4 w-3/4" /> {/* CardDescription */}
            </div>
            {/* No New Order Button Skeleton here for staff */}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-grow" /> {/* Search Input */}
            <Skeleton className="h-10 w-full sm:w-[200px]" /> {/* Status Filter Select */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {Array(6).fill(0).map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[150px] rounded-md" /></TableCell>
                  <TableCell className="text-right space-x-1">
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


export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [availableMenuItems, setAvailableMenuItems] = useState<Pick<MenuItemType, 'id' | 'name' | 'price'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get('status') as OrderStatus | 'all' || 'all';
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatusFilter);

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
          }
        }
      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
        console.error(e);
        toast({ variant: "destructive", title: "Error", description: e.message || 'Failed to load data.' });
      } finally {
        setIsLoading(false);
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

  const handleEditOrder = (order: OrderType) => {
    setEditingOrder(order);
    setIsEditFormOpen(true);
  };

  const filteredOrders = orders.filter(order =>
    (order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (statusFilter === 'all' || order.status === statusFilter)
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading && orders.length === 0) return <StaffOrdersPageSkeleton />;

  if (error && orders.length === 0) {
    return <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded-md animate-fade-in"><AlertTriangle className="inline mr-2"/>{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="font-headline text-2xl">Order Processing</CardTitle>
                <CardDescription>Manage and update active customer orders.</CardDescription>
              </div>
              {/* New Order button removed for staff page */}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Order # or Customer Name..."
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
           {isLoading && orders.length > 0 && (
             <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Refreshing data...</p>
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
              {!isLoading && filteredOrders.length > 0 ? filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(newStatus) => handleOrderStatusChange(order.id, newStatus as OrderStatus)} disabled={isSubmitting}>
                      <SelectTrigger className="h-8 text-xs w-[150px]">
                         <SelectValue>
                          <Badge variant={getStatusBadgeVariant(order.status)} className={`text-xs ${getStatusBadgeClassName(order.status)}`}>{order.status}</Badge>
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
                    <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)} disabled={isSubmitting}><Edit className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )) : (
                 !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                       {searchTerm || statusFilter !== 'all' ? 'No orders match your criteria.' : 'No orders found.'}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for EDITING an order */}
      {editingOrder && (
        <Dialog open={isEditFormOpen && !!editingOrder} onOpenChange={(open) => { setIsEditFormOpen(open); if (!open) setEditingOrder(null); }}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-headline">Edit Order</DialogTitle>
              <DialogDescription>Modify details for order #{editingOrder.orderNumber}.</DialogDescription>
            </DialogHeader>
            <OrderForm
              onSubmit={handleEditFormSubmit as any}
              initialData={editingOrder}
              menuItems={availableMenuItems}
              onCancel={() => {setIsEditFormOpen(false); setEditingOrder(null);}}
            />
          </DialogContent>
        </Dialog>
      )}

      {viewingOrder && (
        <OrderDetailsDialog order={viewingOrder} open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)} />
      )}
    </div>
  );
}


    
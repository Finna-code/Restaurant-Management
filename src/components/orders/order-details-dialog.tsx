
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Order, OrderItem } from "@/lib/types";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Package, User, CalendarDays, Edit3, ShoppingCart } from "lucide-react";
import { formatInr } from "@/lib/currency-utils";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadgeVariant = (status: Order["status"]) => {
  switch (status) {
    case 'Placed': return 'secondary';
    case 'In Preparation': return 'default'; 
    case 'Ready for Pickup': return 'outline'; 
    case 'Out for Delivery': return 'outline'; 
    case 'Delivered': return 'default'; 
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

const getStatusBadgeClassName = (status: Order["status"]): string => {
  switch (status) {
    case 'In Preparation': return 'bg-blue-500 text-white';
    case 'Ready for Pickup': return 'bg-yellow-500 text-black';
    case 'Out for Delivery': return 'bg-orange-500 text-white';
    case 'Delivered': return 'bg-green-500 text-white';
    default: return '';
  }
}


export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center">
            <Package className="mr-3 h-7 w-7 text-primary" /> Order Details: #{order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Detailed information for order #{order.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg flex items-center"><User className="mr-2 h-5 w-5 text-muted-foreground"/>Customer</h3>
              <p><strong className="text-muted-foreground">Name:</strong> {order.customerName}</p>
              <p><strong className="text-muted-foreground">Contact:</strong> {order.customerContact}</p>
              {order.deliveryAddress && (
                <p><strong className="text-muted-foreground">Address:</strong> {order.deliveryAddress}</p>
              )}
            </div>

            {/* Order Meta */}
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <h3 className="font-semibold text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-muted-foreground"/>Timestamps</h3>
              <p><strong className="text-muted-foreground">Placed:</strong> {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}</p>
              <p><strong className="text-muted-foreground">Last Updated:</strong> {format(new Date(order.updatedAt), "MMM d, yyyy HH:mm")}</p>
              {order.estimatedDeliveryTime && (
                <p><strong className="text-muted-foreground">Est. Delivery:</strong> {format(new Date(order.estimatedDeliveryTime), "MMM d, yyyy HH:mm")}</p>
              )}
            </div>
          </div>

          {/* Status and Total */}
           <div className="flex flex-col sm:flex-row justify-between items-center p-4 border rounded-lg bg-card space-y-3 sm:space-y-0">
            <div>
              <span className="font-semibold text-lg">Status: </span>
              <Badge variant={getStatusBadgeVariant(order.status)} className={`text-lg ${getStatusBadgeClassName(order.status)}`}>
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-xl">Total: {formatInr(order.totalAmount)}</span>
            </div>
          </div>


          {/* Items List */}
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-muted-foreground" /> Items Ordered
            </h3>
            {order.items && order.items.length > 0 ? (
              <ul className="space-y-3">
                {order.items.map((item: OrderItem, index: number) => {
                  const itemName = item.name || "Item Name Missing";
                  const quantityDisplay = (typeof item.quantity === 'number' && item.quantity > 0) ? item.quantity : "N/A";
                  const priceAtOrder = typeof item.priceAtOrder === 'number' ? item.priceAtOrder : 0;
                  const quantityValue = typeof item.quantity === 'number' ? item.quantity : 0;
                  const subtotal = quantityValue * priceAtOrder;

                  return (
                    <li key={index} className="p-3 border rounded-md bg-background">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {itemName}{" "}
                            <span className="text-sm text-muted-foreground">
                              (Qty: {quantityDisplay})
                            </span>
                          </p>
                          {item.customizations && (
                            <p className="text-xs text-muted-foreground italic">
                              Customizations: {item.customizations}
                            </p>
                          )}
                        </div>
                        <p className="font-medium text-primary">
                          {formatInr(subtotal)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm p-3 border rounded-md bg-background">No items found in this order.</p>
            )}
          </div>

          {order.notes && (
            <div>
              <h3 className="font-semibold text-lg flex items-center"><Edit3 className="mr-2 h-5 w-5 text-muted-foreground"/>Special Notes</h3>
              <p className="p-3 border rounded-md bg-background text-sm italic">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

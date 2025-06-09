
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, PackageCheck, PackageX, Package, CookingPot, ShoppingBag } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInr } from '@/lib/currency-utils';

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'Placed': return <ShoppingBag className="h-6 w-6 text-primary" />;
    case 'In Preparation': return <CookingPot className="h-6 w-6 text-yellow-500" />;
    case 'Ready for Pickup':
    case 'Out for Delivery': return <Package className="h-6 w-6 text-blue-500" />;
    case 'Delivered': return <PackageCheck className="h-6 w-6 text-green-500" />;
    case 'Cancelled': return <PackageX className="h-6 w-6 text-destructive" />;
    default: return <ShoppingBag className="h-6 w-6 text-muted-foreground" />;
  }
};

const statusSteps: OrderStatus[] = ['Placed', 'In Preparation', 'Out for Delivery', 'Delivered'];

// Skeleton for the entire page on initial load
function TrackOrderPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 animate-fade-in">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full mb-2" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-1" />
          <Skeleton className="h-5 w-full mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-full sm:w-24" />
          </div>
        </CardContent>
      </Card>
      {/* Skeleton for the tracked order details card part */}
      <TrackedOrderResultSkeleton />
    </div>
  );
}

// Skeleton specifically for the result display area when loading search
function TrackedOrderResultSkeleton() {
  return (
    <Card className="shadow-xl animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-1/2 mb-1" /> {/* Order Number Skeleton */}
            <Skeleton className="h-4 w-3/4" /> {/* Status as of Skeleton */}
          </div>
          <Skeleton className="h-6 w-6 rounded-sm" /> {/* Status Icon Skeleton */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-7 w-1/3 mx-auto mb-1" /> {/* Status Text Skeleton */}
          <Skeleton className="h-4 w-1/2 mx-auto" /> {/* Est. Delivery Skeleton */}
        </div>
        <div>
          <Skeleton className="w-full h-3 mb-1.5" /> {/* Progress Bar Skeleton */}
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-px w-full" /> {/* Separator */}
        <div>
          <Skeleton className="h-5 w-1/3 mb-2" /> {/* Order Summary Title Skeleton */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-px w-full my-2" /> {/* Separator */}
          <Skeleton className="h-5 w-1/4 ml-auto" /> {/* Total Amount Skeleton */}
        </div>
        <div>
          <Skeleton className="h-5 w-1/4 mb-1" /> {/* Delivery Address Title */}
          <Skeleton className="h-4 w-3/4" /> {/* Address Skeleton */}
        </div>
      </CardContent>
    </Card>
  );
}


export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For search API call
  const [isPageLoading, setIsPageLoading] = useState(true); // For initial page structure
  const [searchError, setSearchError] = useState<string | null>(null); // For API errors
  const [inputError, setInputError] = useState<string | null>(null); // For input field errors

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 300); 
    return () => clearTimeout(timer);
  }, []);

  const handleTrackOrder = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const trimmedOrderNumber = orderNumber.trim();

    setInputError(null); // Clear previous input errors
    setSearchError(null); // Clear previous API search errors
    setTrackedOrder(null); // Clear previous order details

    if (!trimmedOrderNumber) {
      setInputError("Please enter an order number.");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(trimmedOrderNumber)}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setTrackedOrder(result.data);
        } else {
          setSearchError(result.error || `Order with number "${trimmedOrderNumber}" not found or an issue occurred.`);
        }
      } else if (response.status === 404) {
        setSearchError(`Order with number "${trimmedOrderNumber}" not found. Please check the number and try again.`);
      } else {
        const errorData = await response.json().catch(() => ({ error: "An unexpected error occurred." }));
        setSearchError(errorData.error || `Failed to track order. Server responded with status: ${response.status}.`);
      }
    } catch (fetchError: any)
     {
      console.error("Track order fetch error:", fetchError);
      setSearchError(fetchError.message || "A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressValue = () => {
    if (!trackedOrder || trackedOrder.status === 'Cancelled') return 0;
    const currentIndex = statusSteps.indexOf(trackedOrder.status);
    if (currentIndex === -1) { 
        if (trackedOrder.status === 'Ready for Pickup') return 66; // Progress for Ready for Pickup before Out for Delivery
        return 0;
    }
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  if (isPageLoading) {
    return <TrackOrderPageSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 animate-fade-in">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Package className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="font-headline text-3xl">Track Your Order</CardTitle>
          <CardDescription>Enter your order number below to see its current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row items-start gap-3">
            <Input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter Order Number (e.g., EK001)"
              className="flex-grow text-base focus:placeholder:opacity-60"
              aria-label="Order Number"
            />
            <Button type="submit" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? <Skeleton className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
              Track
            </Button>
          </form>
          {inputError && (
             <p className="mt-3 text-sm text-destructive text-center">{inputError}</p>
          )}
        </CardContent>
      </Card>

      {/* Results Area: Loading Skeleton, Order Data, or API Error */}
      {isLoading && (
        <TrackedOrderResultSkeleton />
      )}

      {!isLoading && trackedOrder && (
        <Card className="shadow-xl animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl">Order #{trackedOrder.orderNumber}</CardTitle>
                    <CardDescription>Status as of {format(new Date(trackedOrder.updatedAt), "MMM d, yyyy 'at' HH:mm")}</CardDescription>
                </div>
                {getStatusIcon(trackedOrder.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">{trackedOrder.status}</p>
              {trackedOrder.status === 'Out for Delivery' && trackedOrder.estimatedDeliveryTime && (
                <p className="text-sm text-muted-foreground">
                  Estimated Delivery: {format(new Date(trackedOrder.estimatedDeliveryTime), "HH:mm")}
                </p>
              )}
               {trackedOrder.status === 'Ready for Pickup' && (
                <p className="text-sm text-muted-foreground">
                  Your order is ready for pickup!
                </p>
              )}
            </div>

            {trackedOrder.status !== 'Cancelled' && trackedOrder.status !== 'Delivered' && (
              <div>
                <Progress value={getProgressValue()} className="w-full h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  {statusSteps.map(step => (
                    <span key={step} className={trackedOrder.status === step || (statusSteps.indexOf(trackedOrder.status) > statusSteps.indexOf(step)) || (trackedOrder.status === 'Ready for Pickup' && statusSteps.indexOf(step) <= statusSteps.indexOf('Out for Delivery') ) ? 'font-bold text-primary' : ''}>
                      {step === 'Out for Delivery' && trackedOrder.status === 'Ready for Pickup' ? 'Pickup/Delivery' : step}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {trackedOrder.status === 'Delivered' && (
                <p className="text-center text-green-600">Your order has been successfully delivered. Enjoy your meal!</p>
            )}
            {trackedOrder.status === 'Cancelled' && (
                <p className="text-center text-destructive">This order has been cancelled.</p>
            )}

            <Separator />

            <div>
                <h3 className="font-semibold mb-2">Order Summary:</h3>
                <ul className="space-y-1 text-sm">
                    {trackedOrder.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatInr(item.quantity * item.priceAtOrder)}</span>
                        </li>
                    ))}
                </ul>
                <Separator className="my-2"/>
                <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatInr(trackedOrder.totalAmount)}</span>
                </div>
            </div>

            {trackedOrder.deliveryAddress && (
              <div>
                <h3 className="font-semibold">Delivery Address:</h3>
                <p className="text-sm text-muted-foreground">{trackedOrder.deliveryAddress}</p>
              </div>
            )}
             {!trackedOrder.deliveryAddress && trackedOrder.status !== 'Delivered' && trackedOrder.status !== 'Cancelled' && (
                 <div>
                    <h3 className="font-semibold">Order Type:</h3>
                    <p className="text-sm text-muted-foreground">Takeout</p>
                 </div>
            )}
            
          </CardContent>
        </Card>
      )}

      {!isLoading && searchError && !trackedOrder && (
        <Card className="shadow-xl animate-fade-in border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-destructive flex items-center">
                    <PackageX className="mr-2 h-6 w-6 text-destructive" /> Error Retrieving Order
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{searchError}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

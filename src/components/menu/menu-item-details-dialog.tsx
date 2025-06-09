
'use client';

import type { MenuItem } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, Clock, AlertTriangle, Utensils, MessageSquare } from 'lucide-react';
import { formatInr } from '@/lib/currency-utils';
import { format, formatDistanceToNow } from 'date-fns';

interface MenuItemDetailsDialogProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TagIcon = ({ tagName }: { tagName: string }) => {
  // This can be expanded with more specific icons
  switch (tagName.toLowerCase()) {
    case 'spicy': return <Star className="h-3 w-3 mr-1 text-red-500" />; // Example, use appropriate icons
    case 'vegan':
    case 'vegetarian': return <Star className="h-3 w-3 mr-1 text-green-500" />;
    case 'gluten-free': return <Star className="h-3 w-3 mr-1 text-blue-500" />;
    default: return <Star className="h-3 w-3 mr-1 text-muted-foreground" />;
  }
};


export function MenuItemDetailsDialog({ item, open, onOpenChange }: MenuItemDetailsDialogProps) {
  if (!item) return null;

  const averageRating = item.averageRating ? item.averageRating.toFixed(1) : 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader className="pr-6">
          <DialogTitle className="font-headline text-2xl md:text-3xl">{item.name}</DialogTitle>
          <DialogDescription>{item.category} - {formatInr(item.price)}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-100px)] pr-5">
          <div className="space-y-6 py-4">
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
              <Image
                src={item.imageUrl || "https://placehold.co/800x600.png"}
                alt={item.name}
                data-ai-hint={`${item.category} food high quality`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>

            {!item.availability && (
              <Badge variant="destructive" className="text-base px-3 py-1">Currently Unavailable</Badge>
            )}

            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-primary">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2 flex items-center"><Utensils className="mr-2 h-5 w-5"/>Ingredients</h3>
                {item.ingredients && item.ingredients.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {item.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No ingredients listed.</p>
                )}
              </div>
              <div>
                 {item.prepTime !== undefined && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg text-primary mb-1 flex items-center"><Clock className="mr-2 h-5 w-5"/>Prep Time</h3>
                        <p className="text-sm text-muted-foreground">{item.prepTime} minutes</p>
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">Dietary Tags</h3>
                    {item.tags && item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs flex items-center">
                            <TagIcon tagName={tag} /> {tag}
                        </Badge>
                        ))}
                    </div>
                    ) : (
                    <p className="text-sm text-muted-foreground italic">No specific dietary tags.</p>
                    )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg text-primary mb-3 flex items-center"><MessageSquare className="mr-2 h-5 w-5"/>Customer Feedback</h3>
              <div className="flex items-center mb-3">
                <Star className="h-5 w-5 mr-1 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{averageRating}</span>
                <span className="text-sm text-muted-foreground ml-1">({item.feedbacks?.length || 0} reviews)</span>
              </div>
              {item.feedbacks && item.feedbacks.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 rounded-md border p-3 bg-card/30">
                  {item.feedbacks.map(fb => (
                    <div key={fb.id || fb.userName + fb.createdAt} className="p-3 bg-background rounded shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{fb.userName || "Anonymous"}</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}
                      </p>
                      <p className="text-sm text-foreground/90">{fb.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 px-3 border rounded-md bg-card/30">
                    <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No feedback yet for this item.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


import type { MenuItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Star, Tag, ShoppingCart, MessageSquare, Flame, Leaf, WheatOff, Eye } from 'lucide-react'; // Added Eye icon
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatInr } from '@/lib/currency-utils';
import { MenuItemDetailsDialog } from './menu-item-details-dialog'; // Import the new dialog

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  showAdminActions?: boolean;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
}

const TagIcon = ({ tagName }: { tagName: string }) => {
  switch (tagName.toLowerCase()) {
    case 'spicy': return <Flame className="h-3 w-3 mr-1" />;
    case 'vegan':
    case 'vegetarian': return <Leaf className="h-3 w-3 mr-1" />;
    case 'gluten-free': return <WheatOff className="h-3 w-3 mr-1" />;
    default: return <Tag className="h-3 w-3 mr-1" />;
  }
};

export function MenuItemCard({ item, onAddToCart, showAdminActions, onEdit, onDelete }: MenuItemCardProps) {
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFeedbackSubmit = () => {
    toast({
      title: "Feedback Submitted!",
      description: `Thanks for your feedback on ${item.name}. Rating: ${feedbackRating}, Comment: ${feedbackComment}`,
    });
  };
  
  const averageRating = item.averageRating ? item.averageRating.toFixed(1) : 'N/A';

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <CardHeader className="p-0 relative">
          <Image
            src={item.imageUrl || "https://placehold.co/600x400.png"}
            alt={item.name}
            data-ai-hint={`${item.category} food`}
            width={600}
            height={300}
            className="object-cover w-full h-48"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-xl mb-1">{item.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
            <span>{averageRating} ({item.feedbacks?.length || 0} reviews)</span>
            <span className="mx-2">|</span>
            <span>{item.category}</span>
          </div>
          <CardDescription className="text-sm mb-3 h-12 overflow-hidden text-ellipsis">
            {item.description}
          </CardDescription>
          <div className="flex flex-wrap gap-2 mb-3">
            {item.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs flex items-center">
                <TagIcon tagName={tag} /> {tag}
              </Badge>
            ))}
            {!item.availability && <Badge variant="destructive">Unavailable</Badge>}
          </div>
        </CardContent>
        <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <p className="text-lg font-semibold text-primary">{formatInr(item.price)}</p>
          <div className="flex space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsDialogOpen(true)}
              >
                <Eye className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Details</span>
            </Button>
            {onAddToCart && item.availability && (
              <Button size="sm" onClick={() => onAddToCart(item)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <ShoppingCart className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Add</span>
              </Button>
            )}
            {showAdminActions && onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Edit</Button>
            )}
            {showAdminActions && onDelete && (
              <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>Delete</Button>
            )}
            {!showAdminActions && (
               <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Feedback</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Leave Feedback for {item.name}</DialogTitle>
                    <DialogDescription>Let us know what you think!</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer ${feedbackRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            onClick={() => setFeedbackRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea id="comment" value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Your thoughts..." />
                    </div>
                    <Button onClick={handleFeedbackSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Submit Feedback</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardFooter>
      </Card>
      <MenuItemDetailsDialog 
        item={item} 
        open={isDetailsDialogOpen} 
        onOpenChange={setIsDetailsDialogOpen} 
      />
    </>
  );
}

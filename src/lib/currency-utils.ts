
export function formatInr(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹--.--'; // Fallback for invalid input
  }
  return `₹${amount.toFixed(2)}`;
}


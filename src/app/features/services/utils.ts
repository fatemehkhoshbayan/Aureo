const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const isPast = (d: string) => new Date(d) < new Date();
const formatPrice = (p: number) => `$${p.toLocaleString()}`;

export { formatDate, formatPrice, isPast };

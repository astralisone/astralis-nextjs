export { cn } from './cn';

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return 'Unknown date';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) return 'Unknown date';

  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(date: string | null | undefined) {
  if (!date) return 'Unknown time';

  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
}

export function calculateReadingTime(content: string | null | undefined): string {
  if (!content) return '1 min read';

  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

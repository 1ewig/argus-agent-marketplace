import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let counter = 0;

/**
 * Generates a unique message ID for chat and stream logs
 */
export function generateMessageId(prefix: string = 'msg'): string {
  counter += 1;
  return `${prefix}_${counter}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Obtains the current epoch timestamp
 */
export function getNowTimestamp(): number {
  return Date.now();
}

/**
 * Formats an epoch timestamp into a clean, human-readable relative time string.
 */
export function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
}

/**
 * Formats a price value with localized thousands separators and strict decimal precision.
 */
export function formatPrice(value?: number | null, precision: number = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

/**
 * Truncates an Ethereum/BSC hex address into readable format (e.g. 0x1234...5678)
 */
export function truncateAddress(
  address?: string | null,
  startChars: number = 6,
  endChars: number = 4,
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Resolves raw agent image URLs, handling IPFS and Arweave URI protocols,
 * and stripping malformed/empty targets to ensure clean browser rendering.
 */
export function resolveAgentImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Handle IPFS URIs (ipfs://<cid> or ipfs://ipfs/<cid>)
  if (trimmed.startsWith('ipfs://')) {
    const ipfsPath = trimmed.replace(/^ipfs:\/\/(ipfs\/)?/, '');
    return `https://ipfs.io/ipfs/${ipfsPath}`;
  }

  // Handle Arweave URIs (ar://<txId>)
  if (trimmed.startsWith('ar://')) {
    const arweavePath = trimmed.replace(/^ar:\/\//, '');
    return `https://arweave.net/${arweavePath}`;
  }

  // Handle protocol-relative URLs (//example.com/img.png)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Ensure valid HTTP/HTTPS or data URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  return null;
}

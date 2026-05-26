'use client';

import { formatFileSize, type CompressionStats } from '@/app/lib/images';

interface Props {
  stats: CompressionStats | CompressionStats[];
  className?: string;
}

export default function UploadCompressionInfo({ stats, className = '' }: Props) {
  const list = Array.isArray(stats) ? stats : [stats];
  if (list.length === 0) return null;

  return (
    <ul
      className={`text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg p-3 space-y-1.5 ${className}`}
    >
      {list.map((item, index) => (
        <li key={`${item.fileName}-${index}`}>
          <span className="font-medium">{item.fileName}</span>
          <span className="text-emerald-700">
            {' '}
            — {formatFileSize(item.originalBytes)} → {formatFileSize(item.compressedBytes)}
          </span>
          {item.savedPercent > 0 && (
            <span className="text-emerald-600 font-medium">
              {' '}
              (−{item.savedPercent}%)
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

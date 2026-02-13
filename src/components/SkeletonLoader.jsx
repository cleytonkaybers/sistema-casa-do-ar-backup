import React from 'react';

export default function SkeletonLoader({ count = 5, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array(count).fill(0).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="bg-gray-200 rounded h-12 flex-1 animate-pulse" />
            <div className="bg-gray-200 rounded h-12 w-24 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
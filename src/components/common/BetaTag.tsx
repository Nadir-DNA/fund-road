
import React from 'react';
import { Info } from 'lucide-react';

export default function BetaTag() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-primary text-white px-3 py-1.5 rounded-full border border-primary/50 shadow-md hover:bg-primary/90 transition-colors cursor-help">
        <Info className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Beta
        </span>
      </div>
    </div>
  );
}

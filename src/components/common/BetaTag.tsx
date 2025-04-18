
import React from 'react';
import { Info } from 'lucide-react';

export default function BetaTag() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-primary/20 text-primary px-3 py-1.5 rounded-full border border-primary/30 shadow-sm hover:bg-primary/30 transition-colors">
        <Info className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Beta
        </span>
      </div>
    </div>
  );
}


import React from 'react';
import { Info } from 'lucide-react';

export default function BetaTag() {
  return (
    <div className="w-full bg-primary text-white text-center py-2 z-50">
      <div className="flex items-center justify-center gap-2">
        <Info className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">
          Beta
        </span>
      </div>
    </div>
  );
}

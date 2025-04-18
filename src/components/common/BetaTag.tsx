
import React from 'react';
import { Info } from 'lucide-react';

export default function BetaTag() {
  return (
    <div className="fixed top-0 right-0 z-50 p-2 bg-primary text-white shadow-lg">
      <div className="flex items-center gap-2 px-4 py-2">
        <Info className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">
          Beta
        </span>
      </div>
    </div>
  );
}

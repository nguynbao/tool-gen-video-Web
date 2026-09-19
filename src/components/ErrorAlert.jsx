import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="max-w-2xl mx-auto mb-8 p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-sm">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

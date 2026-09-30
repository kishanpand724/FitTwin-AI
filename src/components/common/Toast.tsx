import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useProfile();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#20211F] text-[#F8F7F4] px-4 py-3 rounded-none shadow-xl border-l-2 border-[#244D3C] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <CheckCircle2 className="w-4 h-4 text-[#A6B6A3] shrink-0" />
      <span className="text-xs font-medium tracking-wide">{toastMessage}</span>
    </div>
  );
};

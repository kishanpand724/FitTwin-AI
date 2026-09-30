import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#E7E5DF] rounded-none max-w-xl mx-auto my-8">
      <div className="w-12 h-12 flex items-center justify-center bg-[#F8F7F4] text-[#244D3C] mb-4 border border-[#E7E5DF]">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="text-xl font-editorial font-medium text-[#20211F] mb-2">{title}</h3>
      <p className="text-sm text-[#20211F]/70 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && actionHref && (
          <Link
            to={actionHref}
            className="px-5 py-2.5 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-medium transition-colors"
          >
            {actionText}
          </Link>
        )}
        {actionText && onAction && !actionHref && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-medium transition-colors"
          >
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2.5 border border-[#E7E5DF] hover:border-[#20211F] text-[#20211F] text-xs uppercase tracking-widest font-medium transition-colors bg-white"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};

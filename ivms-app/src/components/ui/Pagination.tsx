import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const { t } = useTranslation();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-100">
      <span className="hidden sm:inline text-sm text-slate-500">
        {t('pagination.showing', { start: startItem, end: endItem, total: totalItems })}
      </span>
      <span className="sm:hidden text-xs text-slate-500">
        {startItem}-{endItem} / {totalItems}
      </span>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.previous')}
        >
          <ChevronLeft size={20} className="text-slate-600 rtl:rotate-180" />
        </button>
        <span className="text-sm font-medium text-slate-700 min-w-[60px] sm:min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.next')}
        >
          <ChevronRight size={20} className="text-slate-600 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}

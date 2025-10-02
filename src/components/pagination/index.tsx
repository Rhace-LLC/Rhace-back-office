import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const generatePages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1); // always show first page

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const paginationItems = generatePages();

  return (
    <div className="mt-4 flex w-full items-center justify-between">
      {/* Left Arrow */}
      <div
        onClick={handlePrevious}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:cursor-pointer hover:opacity-80"
      >
        <ChevronLeft className="h-5 w-5" />
      </div>

      {/* Page Numbers */}
      <div className="flex items-center space-x-2">
        {paginationItems.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <div
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                page === currentPage
                  ? "bg-black text-white"
                  : "cursor-pointer bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {page}
            </div>
          )
        )}
      </div>

      {/* Right Arrow */}
      <div
        onClick={handleNext}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:cursor-pointer hover:opacity-80"
      >
        <ChevronRight className="h-5 w-5" />
      </div>
    </div>
  );
};

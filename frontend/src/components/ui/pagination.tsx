import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
  /** Maximum number of page buttons to show */
  maxVisible?: number;
}

export function Pagination({
  meta,
  onPageChange,
  className,
  maxVisible = 5,
}: PaginationProps) {
  const { current_page, last_page, total } = meta;

  if (last_page <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (last_page <= maxVisible) {
      // Show all pages if total is less than maxVisible
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, current_page - 1);
      let end = Math.min(last_page - 1, current_page + 1);

      // Adjust range to show maxVisible-2 pages in the middle
      if (current_page <= 3) {
        end = Math.min(maxVisible - 1, last_page - 1);
      } else if (current_page >= last_page - 2) {
        start = Math.max(2, last_page - maxVisible + 2);
      }

      // Add ellipsis before middle pages if needed
      if (start > 2) {
        pages.push("ellipsis");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle pages if needed
      if (end < last_page - 1) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(last_page);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div
      className={cn("flex items-center justify-between gap-4 py-4", className)}
    >
      {/* Info */}
      <p className="text-sm text-muted-foreground hidden sm:block">
        Trang {current_page} / {last_page} ({total} kết quả)
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-8 h-8"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </span>
            ) : (
              <Button
                key={page}
                variant={current_page === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;

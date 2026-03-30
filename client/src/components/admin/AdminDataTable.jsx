import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpinnerCustom } from "@/components/ui/spinner";

const RowActionsMenu = ({ row, actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg leading-none text-muted-foreground hover:text-foreground"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onMouseDown={(event) => event.preventDefault()}
      >
        <span className="text-lg leading-none">⋮</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-30 w-48 rounded-md border bg-background shadow-md"
        >
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setIsOpen(false);
                action.onClick(row);
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-muted"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminDataTable = ({
  title,
  description,
  columns,
  rows = [],
  loading,
  emptyMessage = "No data found.",
  rowActions,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="shadow-sm">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className={loading || rows.length === 0 ? "pb-6" : "p-0"}>
        {loading ? (
          <div className="flex justify-center py-12">
            <SpinnerCustom />
          </div>
        ) : rows.length === 0 ? (
          <div className="mx-6 mt-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                    {columns.map((column) => (
                      <th key={column.key} className="px-6 py-4 font-medium">
                        {column.label}
                      </th>
                    ))}
                    {rowActions && (
                      <th className="px-6 py-4 text-right font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, index) => (
                    <tr
                      key={row._id || index}
                      className="border-b transition-colors hover:bg-muted/30 last:border-b-0"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 align-middle text-foreground"
                        >
                          {column.render ? column.render(row) : row[column.key] || "-"}
                        </td>
                      ))}
                      {rowActions && (
                        <td className="px-6 py-4 text-right align-middle">
                          <RowActionsMenu row={row} actions={rowActions} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

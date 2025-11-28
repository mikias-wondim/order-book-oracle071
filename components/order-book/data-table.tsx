"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Filter, XCircle } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
}

const ORDER_STATUSES = [
  "Open",
  "Pending",
  "Canceled",
  "Failed",
  "Partial",
  "Completed",
];
const getStatusTextColor = (status: string): string => {
  switch (status) {
    case "Open":
      return "text-blue-600 dark:text-blue-400";
    case "Completed":
      return "text-emerald-600 dark:text-emerald-400";
    case "Canceled":
      return "text-red-600 dark:text-red-400";
    case "Failed":
      return "text-rose-600 dark:text-rose-400";
    case "Pending":
      return "text-amber-600 dark:text-amber-400";
    case "Partial":
      return "text-slate-500 dark:text-slate-400";
    default:
      return "";
  }
};

export function DataTable<TData, TValue>({
  columns,
  data,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [expanded, setExpanded] = React.useState({});

  React.useEffect(() => {
    if (columnFilters.length === 0) {
      setColumnFilters([{ id: "status", value: ["Open"] }]);
    }
  }, [columnFilters.length]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      expanded,
    },
  });

  const handleStatusToggle = (status: string) => {
    const newSet = new Set(selectedStatuses);

    if (newSet.has(status)) {
      newSet.delete(status);
    } else {
      newSet.add(status);
    }

    setSelectedStatuses(newSet);
    table.getColumn("status")?.setFilterValue(Array.from(newSet));
  };

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectedStatuses, setSelectedStatuses] = React.useState<Set<string>>(
    new Set(["Open"])
  );

  return (
    <Card className="w-full border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="sticky top-[117px] z-10 bg-background border-b border-border/40 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Order Book
          </CardTitle>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {selectedStatuses.size > 0 && (
                  <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
                    {selectedStatuses.size}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">
                  Filter by Status
                </DropdownMenuLabel>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="rounded-sm p-1 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <DropdownMenuSeparator />

              {ORDER_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.has(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                  onSelect={(e) => e.preventDefault()}
                  className={getStatusTextColor(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Main Table */}
          <div className="bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        data-expanded={row.getIsExpanded()}
                        className="cursor-pointer transition-colors hover:bg-muted/50 data-[expanded=true]:bg-muted/50"
                        onClick={() => row.toggleExpanded()}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && renderSubComponent && (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="p-0 border-t-0"
                          >
                            {renderSubComponent({ row })}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-2">
            <div className="text-xs text-muted-foreground">
              Showing {table.getRowModel().rows.length} rows
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

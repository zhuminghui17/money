"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { Key, MouseEventHandler, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

interface Transaction {
  date: string;
  name: string;
  amount: number;
  category?: string[];
  personal_finance_category?: {
    detailed?: string;
  };
}

type SortDirection = "false" | "asc" | "desc";

const ModernTable = ({ transactions }: { transactions: Transaction[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const dateFormat = (date: string) => new Date(date).toLocaleDateString();
  const valueFormatter = (value: number) => `$${value.toFixed(2)}`;

  const getAllUniqueCategories = () => {
    const categories = new Set<string>();
    transactions.forEach((transaction) => {
      transaction.category?.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories);
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: (info: any) => dateFormat(info.getValue()),
      sortingFn: (a: any, b: any, columnId: string) => {
        const aDate = new Date(a.getValue(columnId)).getTime();
        const bDate = new Date(b.getValue(columnId)).getTime();
        return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: (a: any, b: any, columnId: string) => {
        const aVal = a.getValue(columnId).toLowerCase();
        const bVal = b.getValue(columnId).toLowerCase();
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info: any) => valueFormatter(info.getValue()),
      sortingFn: (a: any, b: any, columnId: string) => {
        return a.getValue(columnId) - b.getValue(columnId);
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info: any) => (
        <div className="flex flex-wrap gap-2">
          {info.getValue()?.map((categoryItem: string) => (
            <Badge
              key={`categoryItem_${categoryItem}`}
              variant="secondary"
              className="px-2 py-1"
              title={info.row.original.personal_finance_category?.detailed || categoryItem}
            >
              {categoryItem}
            </Badge>
          ))}
        </div>
      ),
      filterFn: (row: any, columnId: string, filterValue: string) => {
        const categories = row.getValue(columnId);
        return categories?.some((category: string) => 
          category.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card className="relative w-full p-6 mt-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full bg-background">
          <Search className="absolute left-2 top-2.5 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {/* Filter by amount range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Amount Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full bg-background">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filter by amount</h4>
                <p className="text-sm text-muted-foreground">
                  Set the minimum and maximum transaction amount
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="minAmount">Min</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    className="col-span-2"
                    value={(table.getColumn("amount")?.getFilterValue() as [number, number])?.[0] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const [_, max] = (table.getColumn("amount")?.getFilterValue() as [number, number]) ?? [
                        undefined,
                        undefined,
                      ];
                      table.getColumn("amount")?.setFilterValue(
                        value ? [Number(value), max] : undefined
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxAmount">Max</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    className="col-span-2"
                    value={(table.getColumn("amount")?.getFilterValue() as [number, number])?.[1] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const [min, _] = (table.getColumn("amount")?.getFilterValue() as [number, number]) ?? [
                        undefined,
                        undefined,
                      ];
                      table.getColumn("amount")?.setFilterValue(
                        value ? [min, Number(value)] : undefined
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {/* Filter by category */}
        <Select
          value={(table.getColumn("category")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => {
            table.getColumn("category")?.setFilterValue(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="w-full text-primary bg-background">
            <SelectValue className="text-primary font-medium border-primary" placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" >All Categories</SelectItem>
            {getAllUniqueCategories().map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Your recent transactions</TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="w-[25%]">
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        className="h-8 flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          "false": <ArrowUpDownIcon className="ml-1 h-4 w-4" />,
                          "asc": <ArrowUpIcon className="ml-1 h-4 w-4" />,
                          "desc": <ArrowDownIcon className="ml-1 h-4 w-4" />,
                        }[String(header.column.getIsSorted() || "false") as SortDirection]}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row: { id: Key | null | undefined; getVisibleCells: () => any[]; }) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell: { id: Key | null | undefined; column: { columnDef: { cell: any; }; }; getContext: () => any; }) => (
                  <TableCell key={cell.id} className="py-4 ml-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ModernTable;

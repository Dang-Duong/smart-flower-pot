import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HistoryRow } from "@/lib/types";

interface HistoryTableProps {
  rows: HistoryRow[];
}

export function HistoryTable({ rows }: HistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-400">
          <TableHead className="text-card-foreground font-bold text-xs text-center">Temperature</TableHead>
          <TableHead className="text-card-foreground font-bold text-xs text-center">Humidity</TableHead>
          <TableHead className="text-card-foreground font-bold text-xs text-center">Light</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i} className="border-gray-300">
            <TableCell className="text-center">
              <span className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-black inline-block w-20">
                {row.temperature} °C
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-black inline-block w-20">
                {row.humidity} %
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-black inline-block w-20">
                {row.light} lx
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

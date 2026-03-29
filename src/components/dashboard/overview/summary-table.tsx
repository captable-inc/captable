import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card } from "@/components/ui/card";
const formatter = new Intl.NumberFormat("en-US");

type SummaryTableProps = {
  shareClasses: {
    id: string;
    name: string;
    authorizedShares: number;
    issuedShares: number;
    ownership: number;
  }[];
};

const SummaryTable = ({ shareClasses }: SummaryTableProps) => {
  return (
    <Card className="mt-4">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Share class</TableHead>
            <TableHead>Authorized shares</TableHead>
            <TableHead>Issued shares</TableHead>
            <TableHead>Ownership</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shareClasses.map((klass) => (
            <TableRow key={klass.id} className="border-none">
              <TableCell className="font-medium">{klass.name}</TableCell>
              <TableCell>{formatter.format(klass.authorizedShares)}</TableCell>
              <TableCell>{formatter.format(klass.issuedShares)}</TableCell>
              <TableCell>{formatter.format(klass.ownership)} %</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>
              {formatter.format(
                shareClasses.reduce((sum, sc) => sum + sc.authorizedShares, 0),
              )}
            </TableCell>
            <TableCell>
              {formatter.format(
                shareClasses.reduce((sum, sc) => sum + sc.issuedShares, 0),
              )}
            </TableCell>
            <TableCell>
              {formatter.format(
                shareClasses.reduce((sum, sc) => sum + sc.ownership, 0),
              )}{" "}
              %
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
};

export default SummaryTable;

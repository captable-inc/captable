"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiCheckboxCircleLine, RiLoader4Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Agreement {
  id: string;
  type: string;
  status: string;
  partyName: string | null;
  partyEmail: string | null;
  effectiveDate: string | null;
  quantity: number | null;
  matchConfidence: number | null;
  stakeholder: { id: string; name: string; email: string } | null;
  createdAt: string;
}

interface AgreementTableProps {
  agreements: Agreement[];
  publicId: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REVIEWED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMMITTED: "bg-green-500/20 text-green-400 border-green-500/30",
  FLAGGED: "bg-red-500/20 text-red-400 border-red-500/30",
  REJECTED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  REVIEWED: "Reviewed",
  COMMITTED: "Committed",
  FLAGGED: "Flagged",
  REJECTED: "Rejected",
};

type TabFilter = "ALL" | "PENDING_REVIEW" | "FLAGGED" | "COMMITTED";

export function AgreementTable({ agreements, publicId }: AgreementTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [committing, setCommitting] = useState(false);

  const tabs: { label: string; value: TabFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending Review", value: "PENDING_REVIEW" },
    { label: "Flagged", value: "FLAGGED" },
    { label: "Committed", value: "COMMITTED" },
  ];

  const filtered =
    activeTab === "ALL"
      ? agreements
      : agreements.filter((a) => a.status === activeTab);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  const handleBulkCommit = async () => {
    const committable = Array.from(selected).filter((id) => {
      const a = agreements.find((ag) => ag.id === id);
      return a && a.status !== "COMMITTED" && a.status !== "FLAGGED";
    });

    if (committable.length === 0) return;
    setCommitting(true);

    try {
      await fetch("/api/admin/agreements/bulk-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: committable }),
      });
      router.refresh();
      setSelected(new Set());
    } finally {
      setCommitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <Button
            size="sm"
            onClick={handleBulkCommit}
            disabled={committing}
          >
            {committing ? (
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiCheckboxCircleLine className="mr-2 h-4 w-4" />
            )}
            Commit Selected ({selected.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 && selected.size === filtered.length
                  }
                  onChange={toggleAll}
                  className="rounded border-border"
                />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Party Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Matched To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No agreements found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((agreement) => (
                <TableRow
                  key={agreement.id}
                  className="cursor-pointer hover:bg-secondary/50"
                  onClick={() =>
                    router.push(
                      `/${publicId}/documents/agreements/${agreement.id}`,
                    )
                  }
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(agreement.id)}
                      onChange={() => toggleSelect(agreement.id)}
                      className="rounded border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[agreement.status] || ""}
                    >
                      {STATUS_LABELS[agreement.status] || agreement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {agreement.partyName || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {agreement.type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(agreement.effectiveDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {agreement.quantity?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell>
                    {agreement.stakeholder ? (
                      <span className="text-foreground">
                        {agreement.stakeholder.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No match</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

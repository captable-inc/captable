"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PdfViewer } from "@/components/ui/pdf-viewer";
import {
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiSaveLine,
  RiAlertLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AgreementData {
  id: string;
  type: string;
  status: string;
  partyName: string | null;
  partyEmail: string | null;
  role: string | null;
  effectiveDate: string | null;
  startDate: string | null;
  quantity: number | null;
  unitsPerPeriod: number | null;
  vestingPeriods: number | null;
  vestingCliffDays: number | null;
  vestingPeriodMonths: number | null;
  pricePerShare: number | null;
  totalAmount: number | null;
  shareClassName: string | null;
  matchConfidence: number | null;
  discrepancies: string | null;
  stakeholder: { id: string; name: string; email: string } | null;
  bucket: { id: string; key: string; name: string };
}

interface AgreementReviewProps {
  agreement: AgreementData;
  pdfUrl: string;
  publicId: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REVIEWED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMMITTED: "bg-green-500/20 text-green-400 border-green-500/30",
  FLAGGED: "bg-red-500/20 text-red-400 border-red-500/30",
  REJECTED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export function AgreementReview({
  agreement,
  pdfUrl,
  publicId,
}: AgreementReviewProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);

  const [form, setForm] = useState({
    partyName: agreement.partyName ?? "",
    partyEmail: agreement.partyEmail ?? "",
    type: agreement.type,
    role: agreement.role ?? "",
    effectiveDate: agreement.effectiveDate
      ? agreement.effectiveDate.slice(0, 10)
      : "",
    startDate: agreement.startDate ? agreement.startDate.slice(0, 10) : "",
    quantity: agreement.quantity?.toString() ?? "",
    unitsPerPeriod: agreement.unitsPerPeriod?.toString() ?? "",
    vestingPeriods: agreement.vestingPeriods?.toString() ?? "",
    vestingCliffDays: agreement.vestingCliffDays?.toString() ?? "",
    vestingPeriodMonths: agreement.vestingPeriodMonths?.toString() ?? "",
    pricePerShare: agreement.pricePerShare?.toString() ?? "",
    totalAmount: agreement.totalAmount?.toString() ?? "",
  });

  const isContractor = form.type === "CONTRACTOR";

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/agreements/${agreement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleCommit = async () => {
    setCommitting(true);
    try {
      const res = await fetch(
        `/api/admin/agreements/${agreement.id}/commit`,
        { method: "POST" },
      );
      if (res.ok) {
        router.push(`/${publicId}/documents/agreements`);
        router.refresh();
      }
    } finally {
      setCommitting(false);
    }
  };

  const handleReject = async () => {
    await fetch(`/api/admin/agreements/${agreement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    router.push(`/${publicId}/documents/agreements`);
    router.refresh();
  };

  const discrepancies: string[] = agreement.discrepancies
    ? JSON.parse(agreement.discrepancies)
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Left: PDF Viewer */}
      <div className="lg:col-span-3">
        <Card className="overflow-hidden p-0">
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
            <PdfViewer file={pdfUrl} />
          </div>
        </Card>
      </div>

      {/* Right: Form */}
      <div className="space-y-4 lg:col-span-2">
        {/* Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant="outline"
              className={STATUS_STYLES[agreement.status] || ""}
            >
              {agreement.status.replace("_", " ")}
            </Badge>
          </div>
        </Card>

        {/* Discrepancies */}
        {discrepancies.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <RiAlertLine className="h-4 w-4" />
              <span className="text-sm font-medium">Discrepancies</span>
            </div>
            <ul className="mt-2 space-y-1">
              {discrepancies.map((d, i) => (
                <li key={i} className="text-xs text-amber-300/80">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Matched Stakeholder */}
        {agreement.stakeholder && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Matched: {agreement.stakeholder.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {agreement.stakeholder.email}
                </p>
              </div>
              {agreement.matchConfidence != null && (
                <Badge
                  variant="outline"
                  className={
                    agreement.matchConfidence >= 0.9
                      ? "border-green-500/30 bg-green-500/20 text-green-400"
                      : agreement.matchConfidence >= 0.7
                        ? "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                        : "border-red-500/30 bg-red-500/20 text-red-400"
                  }
                >
                  {Math.round(agreement.matchConfidence * 100)}% match
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Form fields */}
        <Card className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Party Name
            </label>
            <Input
              value={form.partyName}
              onChange={(e) => update("partyName", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Email
            </label>
            <Input
              value={form.partyEmail}
              onChange={(e) => update("partyEmail", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Agreement Type
            </label>
            <Select
              value={form.type}
              onValueChange={(v) => update("type", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                <SelectItem value="INVESTOR">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isContractor && (
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Role / Position
              </label>
              <Input
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Effective Date
              </label>
              <Input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => update("effectiveDate", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Start Date
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Total Quantity (units/shares)
            </label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
            />
          </div>

          {isContractor && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Units Per Period
                  </label>
                  <Input
                    type="number"
                    value={form.unitsPerPeriod}
                    onChange={(e) => update("unitsPerPeriod", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Vesting Periods
                  </label>
                  <Input
                    type="number"
                    value={form.vestingPeriods}
                    onChange={(e) => update("vestingPeriods", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Cliff (days)
                  </label>
                  <Input
                    type="number"
                    value={form.vestingCliffDays}
                    onChange={(e) => update("vestingCliffDays", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Vesting (months)
                  </label>
                  <Input
                    type="number"
                    value={form.vestingPeriodMonths}
                    onChange={(e) =>
                      update("vestingPeriodMonths", e.target.value)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {!isContractor && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Price Per Share
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.pricePerShare}
                  onChange={(e) => update("pricePerShare", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Total Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => update("totalAmount", e.target.value)}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleCommit}
            disabled={committing || agreement.status === "COMMITTED"}
            className="flex-1"
          >
            {committing ? (
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiCheckLine className="mr-2 h-4 w-4" />
            )}
            Commit to Cap Table
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? (
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiSaveLine className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            className="text-destructive hover:text-destructive"
          >
            <RiCloseLine className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

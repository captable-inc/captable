import ActivitiesCard from "@/components/dashboard/overview/activities-card";
import DonutCard from "@/components/dashboard/overview/donut-card";
import SummaryTable from "@/components/dashboard/overview/summary-table";
import OverviewCard from "@/components/dashboard/overview/top-card";
import { withServerSession } from "@/server/auth";
import { db } from "@/server/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

const OverviewPage = async ({
  params: { publicId },
}: {
  params: { publicId: string };
}) => {
  const { user } = await withServerSession();
  const companyId = user.companyId;

  const [
    aggregates,
    stakeholderCount,
    sharesByStakeholder,
    sharesByClass,
    allShareClasses,
  ] = await Promise.all([
    db.share.aggregate({
      where: { companyId },
      _sum: { quantity: true, capitalContribution: true },
    }),
    db.stakeholder.count({ where: { companyId } }),
    db.share.groupBy({
      by: ["stakeholderId"],
      where: { companyId },
      _sum: { quantity: true },
    }),
    db.share.groupBy({
      by: ["shareClassId"],
      where: { companyId },
      _sum: { quantity: true },
    }),
    db.shareClass.findMany({ where: { companyId } }),
  ]);

  const amountRaised = aggregates._sum.capitalContribution ?? 0;
  const totalShares = aggregates._sum.quantity ?? 0;

  // Top stakeholders by ownership %
  const stakeholderIds = sharesByStakeholder.map((s) => s.stakeholderId);
  const stakeholderRecords =
    stakeholderIds.length > 0
      ? await db.stakeholder.findMany({
          where: { id: { in: stakeholderIds } },
          select: { id: true, name: true, institutionName: true },
        })
      : [];
  const stakeholderNameMap = new Map(
    stakeholderRecords.map((s) => [s.id, s.institutionName || s.name]),
  );

  const stakeholderOwnership = sharesByStakeholder
    .map((s) => ({
      key: stakeholderNameMap.get(s.stakeholderId) ?? "Unknown",
      value:
        totalShares > 0
          ? Math.round(((s._sum.quantity ?? 0) / totalShares) * 100)
          : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const top5 = stakeholderOwnership.slice(0, 5);
  const othersValue = stakeholderOwnership
    .slice(5)
    .reduce((sum, s) => sum + s.value, 0);
  const donutStakeholders =
    othersValue > 0 ? [...top5, { key: "Others", value: othersValue }] : top5;

  // Share classes for donut chart
  const shareClassMap = new Map(allShareClasses.map((sc) => [sc.id, sc.name]));
  const donutShareClasses = sharesByClass
    .map((s) => ({
      key: shareClassMap.get(s.shareClassId) ?? "Unknown",
      value:
        totalShares > 0
          ? Math.round(((s._sum.quantity ?? 0) / totalShares) * 100)
          : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Summary table data
  const sharesByClassMap = new Map(
    sharesByClass.map((s) => [s.shareClassId, s._sum.quantity ?? 0]),
  );
  const summaryShareClasses = allShareClasses.map((sc) => {
    const issuedShares = sharesByClassMap.get(sc.id) ?? 0;
    return {
      id: sc.id,
      name: sc.name,
      authorizedShares: Number(sc.initialSharesAuthorized),
      issuedShares,
      ownership:
        totalShares > 0 ? Math.round((issuedShares / totalShares) * 100) : 0,
    };
  });

  return (
    <>
      {/* <EmptyOverview firstName={firstName} publicCompanyId={publicCompanyId} /> */}

      <header>
        <h3 className="font-medium">Overview</h3>
        <p className="text-sm text-muted-foreground">
          View your company{`'`}s captable overview
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="sm:col-span-12 md:col-span-6 lg:col-span-8">
          {/* Overview */}
          <section className="mt-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <OverviewCard
                title="Amount raised"
                amount={amountRaised}
                prefix="$"
              />
              <OverviewCard title="Diluted shares" amount={totalShares} />
              <OverviewCard
                title="Stakeholders"
                amount={stakeholderCount}
                format={false}
              />
            </div>
          </section>

          {/* Tremor chart */}
          <section className="mt-6">
            <DonutCard
              stakeholders={donutStakeholders}
              shareClasses={donutShareClasses}
            />
          </section>
        </div>

        <div className="mt-6 sm:col-span-12 md:col-span-6 lg:col-span-4">
          <ActivitiesCard
            publicId={publicId}
            className="border-none bg-transparent shadow-none"
          />
        </div>
      </div>

      <div className="mt-10">
        <h4 className="font-medium">Summary</h4>
        <p className="text-sm text-muted-foreground">
          Summary of your company{`'`}s captable
        </p>

        <SummaryTable shareClasses={summaryShareClasses} />
      </div>
    </>
  );
};

export default OverviewPage;

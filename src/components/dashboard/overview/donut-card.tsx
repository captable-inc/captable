"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DonutChart } from "@tremor/react";
import { Fragment, useEffect, useState } from "react";
import DonutSelector from "./donut-selector";

type DonutTooltipProps = {
  name: string;
  value: number;
};

type DonutCardProps = {
  stakeholders: { key: string; value: number }[];
  shareClasses: { key: string; value: number }[];
};

const DonutCard = ({ stakeholders, shareClasses }: DonutCardProps) => {
  const [isClient, setIsClient] = useState(false);
  const [selected, setSelected] = useState("stakeholder");

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Fragment>
      {isClient && (
        <Card className="h-[365px]">
          <CardHeader>
            <div className="text-sm text-foreground/70">
              <div className="flex">
                <span>Ownership by</span>
                <DonutSelector selected={selected} onChange={setSelected} />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <ScrollArea className="h-60 w-full py-4 pr-8">
                <ul className="space-y-3 text-sm">
                  {selected === "stakeholder"
                    ? stakeholders.map((stakeholder) => (
                        <li
                          key={stakeholder.key}
                          className="flex justify-between"
                        >
                          <span className="font-medium">{stakeholder.key}</span>
                          <span>{stakeholder.value}%</span>
                        </li>
                      ))
                    : shareClasses.map((stakeholder) => (
                        <li
                          key={stakeholder.key}
                          className="flex justify-between"
                        >
                          <span className="font-medium">{stakeholder.key}</span>
                          <span>{stakeholder.value}%</span>
                        </li>
                      ))}
                </ul>
              </ScrollArea>

              <DonutChart
                className="h-60 py-4"
                data={selected === "stakeholder" ? stakeholders : shareClasses}
                category="value"
                index="key"
                showLabel={false}
                showAnimation={true}
                customTooltip={({ payload }) => {
                  if (Array.isArray(payload) && payload.length > 0) {
                    const data = payload[0] as DonutTooltipProps;

                    return (
                      <div className="rounded bg-popover p-2 shadow-md">
                        <p className="text-xs text-primary/80">
                          <span className="font-semibold">{data.name}</span>:{" "}
                          {data.value}%
                        </p>
                      </div>
                    );
                  }

                  return null;
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </Fragment>
  );
};

export default DonutCard;

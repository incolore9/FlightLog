"use client";

import Sidebar from "@/components/common/Sidebar";
import dynamic from "next/dynamic";

const MultipleAxesCharts = dynamic(
  () => import("@/components/log/charts/MultipleAxesCharts"),
  { ssr: false },
);

const SynchronisedCharts = dynamic(
  () => import("@/components/log/charts/SynchronisedCharts"),
  { ssr: false },
);

export default function LogPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="block">
        <MultipleAxesCharts />
        <SynchronisedCharts numOfDatasets={2} />
      </div>
    </div>
  );
}

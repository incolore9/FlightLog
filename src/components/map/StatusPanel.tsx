"use client";

import { useStatusData } from "@/hooks/useStatusData";
import useData from "@/store/useData";

interface StatusPanelProps {
  progress: number;
  selectedFlight: string;
}

export default function StatusPanel({
  progress,
  selectedFlight,
}: StatusPanelProps) {
  const { allTimestamps, operationTimestamps, selectedOperationId } = useData();
  const currentData = useStatusData({
    progress,
    allTimestamps,
    operationTimestamps,
    selectedOperationId,
  });

  const filteredData = currentData.filter(
    (data) => data.flightId === selectedFlight,
  );
  const statusData = filteredData.length > 0 ? filteredData[0].status : null;

  return (
    <div className="text-balck flex max-h-full w-[280px] flex-col gap-6 rounded-[30px] bg-white py-6 pl-10 opacity-100">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <img src="/images/map/icon-Altitude.svg" alt="Altitude" />
          <div>비행 정보</div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <div>고도</div>
            <div>{statusData?.alt ?? "-"}</div>
          </div>
          <div className="flex-1">
            <div>방향</div>
            <div>{statusData?.heading ?? "-"}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <img src="/images/map/icon-Accuracy.svg" alt="Accuracy" />
          <div>속도/시간 정보</div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <div>속도</div>
            <div>{statusData?.groundSpeed ?? "-"}</div>
          </div>
          <div className="flex-1">
            <div>비행 시간</div>
            <div>{statusData?.flightTime ?? "-"}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <img src="/images/map/icon-Flight.svg" alt="Flight info" />
          <div>배터리 정보</div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <div>온도</div>
            <div>{statusData?.temperature ?? "-"}</div>
          </div>
          <div className="flex-1">
            <div>배터리 잔량</div>
            <div>{statusData?.batteryRemaining ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

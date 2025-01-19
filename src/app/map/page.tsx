"use client";

import Sidebar from "@/components/common/Sidebar";
import StatusPanel from "@/components/map/StatusPanel";
import AttitudePanel from "@/components/map/AttitudePanel";
import FlightProgressBar from "@/components/map/FlightProgressBar";
import ControlPanel from "@/components/map/ControlPanel";
import { useState } from "react";
import useSidebarStore from "@/store/useSidebar";
import useResizePanelControl from "@/hooks/useResizePanelControl";
import SelectFlightLog from "@/components/map/SelectFlightLog";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
});

export default function MapPage() {
  const { isSidebarOpen } = useSidebarStore();
  const { isStatusOpen, setIsStatusOpen, isAttitudeOpen, setIsAttitudeOpen } =
    useResizePanelControl();
  const [selectedFlight, setSelectedFlight] = useState("all");
  const [progress, setProgress] = useState(0);

  const toggleStatusPanel = () => {
    setIsStatusOpen(!isStatusOpen);
  };

  const toggleAttitudePanel = () => {
    setIsAttitudeOpen(!isAttitudeOpen);
  };

  const zoomToDrone = () => {
    // Todo
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      <div
        className={`${isSidebarOpen ? "md:block" : "md:hidden"} z-20 md:absolute`}
      >
        <Sidebar />
      </div>
      <div className="relative h-full min-w-[344px] flex-1 border-red-600">
        <div className="h-full">
          <MapView
            selectedFlight={selectedFlight}
            progress={progress}
            onMarkerClick={setSelectedFlight}
          />
        </div>
        <div className="absolute right-8 top-8 z-10 flex h-[90%] flex-col gap-4">
          <SelectFlightLog
            value={selectedFlight}
            onSelect={setSelectedFlight}
            setProgress={setProgress}
          />
          <div
            className={`${isStatusOpen ? "block" : "hidden"} overflow-hidden`}
          >
            <StatusPanel />
          </div>
          <div className={`${isAttitudeOpen ? "block" : "hidden"}`}>
            <AttitudePanel />
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 z-10 w-1/2 min-w-80 -translate-x-1/2">
          <FlightProgressBar progress={progress} setProgress={setProgress} />
          <div className="flex justify-center">
            <ControlPanel
              onFlightInfoClick={toggleStatusPanel}
              onAttitudeClick={toggleAttitudePanel}
              onZoomClick={zoomToDrone}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

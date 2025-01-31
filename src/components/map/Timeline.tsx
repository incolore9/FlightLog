import { TIMELINE } from "@/constants";
import { getTimelineStyles } from "@/utils/getTimelineStyles";
import { TimelineData } from "@/types/types";

interface Props {
  allTimestamps: number[];
  operationTimestamps: Record<string, number[]>;
  onTimelineClick: (id: string, timelineData: TimelineData[]) => void;
}

export default function Timeline({
  allTimestamps,
  operationTimestamps,
  onTimelineClick,
}: Props) {
  const startTimestamp = allTimestamps[0];
  const endTimestamp = allTimestamps[allTimestamps.length - 1];
  const totalDuration = endTimestamp - startTimestamp;

  const timelineData = calculateTimelineData(operationTimestamps);
  const maxLayer = Math.max(...timelineData.map((op) => op.layer));
  const maxLayerHeight = (maxLayer + 1) * (TIMELINE.HEIGHT + TIMELINE.GAP);

  function calculateTimelineData(
    operationTimestamps: Record<string, number[]>,
  ) {
    const timelineData = Object.entries(operationTimestamps).map(
      ([id, timestamps]) => {
        const start = Math.min(...timestamps);
        const end = Math.max(...timestamps);
        return { id, start, end };
      },
    );

    return setLayers(timelineData);
  }

  function setLayers(
    timelineData: { id: string; start: number; end: number }[],
  ) {
    const layers: number[] = []; // 각 층의 가장 최근 end값을 저장

    return timelineData.map((operation) => {
      const layerIndex = layers.findIndex(
        (endTime) => operation.start >= endTime,
      );

      // 사용할 수 있는 층이 없으면 새 층 추가, 있으면 기존 층에 배치
      if (layerIndex === -1) {
        layers.push(operation.end);
        return { ...operation, layer: layers.length - 1 };
      } else {
        layers[layerIndex] = operation.end;
        return { ...operation, layer: layerIndex };
      }
    });
  }

  return (
    <div
      className="relative w-full overflow-x-clip"
      style={{ height: `${maxLayerHeight}px` }}
    >
      {timelineData.map((operation) => {
        const styles = getTimelineStyles(
          operation,
          startTimestamp,
          totalDuration,
        );
        return (
          <div
            key={operation.id}
            className="absolute h-1 cursor-pointer rounded-full"
            style={styles}
            onClick={() => onTimelineClick(operation.id, timelineData)}
          />
        );
      })}
    </div>
  );
}

"use client";
import React from "react";
import Highcharts, { color } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/modules/stock";
import HighchartsAccessibility from "highcharts/modules/accessibility";
import useData from "@/store/useData";

if (typeof Highcharts === "object") {
  HighchartsStock(Highcharts);
  HighchartsAccessibility(Highcharts);
}

const BatteryStatusChart = () => {
  const chartComponentRef = React.useRef<HighchartsReact.RefObject>(null);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = React.useState(1000);
  const currentXExtremes = React.useRef<{ min: number | null; max: number | null }>({ min: null, max: null });

  React.useEffect(() => {
    const handleResize = () => {
      const containerWidth = window.innerWidth;

      setChartWidth(containerWidth);

      if (chartComponentRef.current) {
        chartComponentRef.current.chart.reflow();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 마우스가 그래프 플롯 영역에 있을 때만 스크롤 막기
  React.useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const chart = chartComponentRef.current?.chart;
      if (!chart) return;

      const containerRect = chartContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // 플롯 영역 좌표 계산
      const plotLeft = containerRect.left + chart.plotLeft;
      const plotTop = containerRect.top + chart.plotTop;
      const plotRight = plotLeft + chart.plotWidth;
      const plotBottom = plotTop + chart.plotHeight;

      // 마우스 위치가 플롯 영역 내부인지 확인
      const inPlotArea = 
        event.clientX >= plotLeft &&
        event.clientX <= plotRight &&
        event.clientY >= plotTop &&
        event.clientY <= plotBottom;

      if (inPlotArea) {
        event.preventDefault();
      }
    };
    
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  const { telemetryData, selectedOperationId, validOperationLabels } =
    useData();
  const batteryData = telemetryData[147] || [];

  // 데이터 샘플링
  const sampleData = (data: any[], sampleSize: number) => {
    if (data.length <= sampleSize) return data;

    const step = Math.floor(data.length / sampleSize);
    return data.filter((_, index) => index % step === 0);
  };

  // 필터링된 데이터에 샘플링 추가 적용
  const filteredData = sampleData(
    batteryData.filter((data) => selectedOperationId.includes(data.operation)),
    300, //데이터 포인트 갯수
  );

  const hasData = filteredData.length > 0;

  // 데이터가 변경될 때마다 전체 범위 선택
  React.useEffect(() => {
    if (chartComponentRef.current) {
      const chart = chartComponentRef.current.chart;
      chart.xAxis[0].setExtremes(undefined, undefined);
    }
  }, [telemetryData, selectedOperationId]);

  // 1. 차트 인스턴스 등록 방지
  React.useEffect(() => {
    const originalAddChart = (Highcharts.Chart.prototype as any)['addChart'];
    if (!originalAddChart) return;

    (Highcharts.Chart.prototype as any)['addChart'] = function (chart: Highcharts.Chart) {
      if ((chart as any).isIndependent) return;
      originalAddChart.call(this, chart);
    };

    return () => {
      (Highcharts.Chart.prototype as any)['addChart'] = originalAddChart;
    };
  }, []);

  const createChartOptions = () => {
    const colorSchemes = {
      battery: ["#00ff00", "#33cc33", "#269926", "#1a661a"], // green
      temperature: ["#ff6666", "#ff3333", "#ff0000", "#cc0000"], // red
      voltage: ["#3366ff", "#0044cc", "#003399", "#002266"], // blue
    };

    const series = selectedOperationId.map((operationId, index) => {
      const operationData = filteredData
        .filter((data) => data.operation === operationId)
        .sort(
          (currentData, nextData) =>
            new Date(currentData.timestamp).getTime() -
            new Date(nextData.timestamp).getTime(),
        );

      if (operationData.length === 0) return [];

      const times = operationData.map((telemetryPoint) =>
        new Date(telemetryPoint.timestamp).getTime(),
      );

      return [
        {
          name: `잔량 (${validOperationLabels[operationId]})`,
          type: "areaspline",
          yAxis: 2,
          color: colorSchemes.battery[index % colorSchemes.battery.length],
          data: operationData.map((data, batterRemain) => [
            times[batterRemain],
            data.payload.batteryRemaining / 100,
          ]),
          tooltip: {
            valueSuffix: "%",
            valueDecimals: 2,
          },
        },
        {
          name: `온도 (${validOperationLabels[operationId]})`,
          type: "spline",
          dashStyle: "shortdot",
          yAxis: 0,
          color:
            colorSchemes.temperature[index % colorSchemes.temperature.length],
          data: operationData.map((data, temp) => [
            times[temp],
            data.payload.temperature / 100,
          ]),
          tooltip: {
            valueSuffix: "°C",
            valueDecimals: 2,
          },
        },
        {
          name: `전압 (${validOperationLabels[operationId]})`,
          type: "line",
          yAxis: 1,
          color: colorSchemes.voltage[index % colorSchemes.voltage.length],
          data: operationData.map((data, volt) => [
            times[volt],
            data.payload.voltages[0] / 1000,
          ]),
          tooltip: {
            valueSuffix: "V",
            valueDecimals: 2,
          },
        },
      ];
    });

    const filteredSeries = series
      .flat()
      .filter((s) => s.data && s.data.length > 0);

    // 그래프 Y축에 사용할 각 데이터 최대, 최소 값
    const tempData = filteredData.map((data) => data.payload.temperature / 100);
    const voltData = filteredData.map(
      (data) => data.payload.voltages[0] / 1000,
    );
    const batteryData = filteredData.map(
      (data) => data.payload.batteryRemaining / 100,
    );

    const tempMax = Math.max(...tempData) < 100 ? 100 : Math.max(...tempData);
    const tempMin = 0;
    const voltMax = Math.max(...voltData) < 30 ? 30 : Math.max(...voltData);
    const voltMin = 0;
    const batteryMax =
      Math.max(...batteryData) < 100 ? 100 : Math.max(...batteryData);
    const batteryMin = 0;

    let sidebarWidth = 320;
    if (window.innerWidth <= 768) {
      sidebarWidth = 0; // 태블릿 이하는 사이드바 숨겨짐
    }

    const chartMinWidth = 280;
    const chartPadding = 40;
    let totalWidth = chartWidth - sidebarWidth - chartPadding;

    if (totalWidth < chartMinWidth) {
      totalWidth = chartMinWidth;
    }

    return {
      chart: {
        height: 600,
        width: totalWidth,
        zooming: {
          mouseWheel: {
            enabled: true,
            type: "x",
          },
        },
        panning: {
          enabled: true,
          type: "x",
        },
        animation: false,
        events: {
          load: function (this: Highcharts.Chart) {
            // 2. 전역 차트 배열에서 제거
            const idx = Highcharts.charts.indexOf(this);
            if (idx > -1) Highcharts.charts.splice(idx, 1);
            (this as any).isIndependent = true;
          }
        }
      },
      plotOptions: {
        series: {
          animation: false,
          dataGrouping: {
            enabled: true,
          },
          showInNavigator: true,
          turboThreshold: 300,
        },
      },
      rangeSelector: {
        enabled: true,
        buttons: [
          {
            type: "minute",
            count: 1,
            text: "1분",
          },
          {
            type: "minute",
            count: 5,
            text: "5분",
          },
          {
            type: "minute",
            count: 30,
            text: "30분",
          },
          {
            type: "hour",
            count: 1,
            text: "1시간",
          },
          {
            type: "day",
            count: 1,
            text: "1일",
          },
          {
            type: "week",
            count: 1,
            text: "1주",
          },
          {
            type: "week",
            count: 2,
            text: "2주",
          },
          {
            type: "month",
            count: 1,
            text: "1달",
          },
          {
            type: "all",
            text: "전체",
          },
        ],
        inputEnabled: false,
        selected: 8,
      },
      navigator: {
        enabled: true,
        height: 80,
        margin: 20,
      },
      scrollbar: {
        enabled: true,
      },
      title: { text: "배터리 상태", y: 20 },
      xAxis: {
        type: "datetime",
        crosshair: true,
        events: {
          afterSetExtremes: function (this: Highcharts.Axis, e: Highcharts.ExtremesObject) {
            // 3. 동기화 이벤트 완전 차단
            if ((e as any).trigger === 'syncExtremes') return;
            currentXExtremes.current = { min: e.min, max: e.max };
          }
        }
      },
      yAxis: [
        {
          title: { text: "온도 (°C)" },
          labels: { format: "{value}°C" },
          max: tempMax,
          min: tempMin,
        },
        {
          title: { text: "전압 (V)" },
          labels: { format: "{value}V" },
          opposite: true,
          max: voltMax,
          min: voltMin,
        },
        {
          title: { text: "배터리 잔량 (%)" },
          labels: { format: "{value}%" },
          max: batteryMax,
          min: batteryMin,
          opposite: true,
        },
      ],
      tooltip: {
        shared: true,
        crosshairs: true,
      },
      series: filteredSeries,
    };
  };

  return (
    <div>
      <div ref={chartContainerRef} className="rounded-lg bg-white p-4">
        {hasData ? (
          <HighchartsReact
            ref={chartComponentRef}
            highcharts={Highcharts}
            options={createChartOptions()}
            callback={(chart: Highcharts.Chart) => {
              // 4. 외부에서의 확대/축소 이벤트 차단
              chart.xAxis[0].setExtremes = function (
                newMin?: number,
                newMax?: number,
                redraw?: boolean,
                animation?: boolean,
                eventArgs?: any
              ) {
                if (eventArgs?.trigger === 'syncExtremes') return;
                return Highcharts.Axis.prototype.setExtremes.call(
                  this,
                  ...Array.from(arguments)
                );
              };
            }}
          />
        ) : (
          <p className="p-10 text-center text-gray-500">
            선택된 데이터가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default BatteryStatusChart;

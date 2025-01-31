"use client";
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface MultipleAxesChartsProps {
  numOfDatasets?: number;
  chartWidth?: number;
  chartHeight?: number;
}

interface Dataset {
  name: string;
  type: string;
  unit: string;
  data: number[];
}

const WeatherChart: React.FC<MultipleAxesChartsProps> = ({
  chartHeight = 400,
  chartWidth = 800,
}) => {
  interface ChartData {
    xData: number[];
    datasets: Dataset[];
  }

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/activity.json");

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }

        const json = await response.json();
        setChartData(json);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    chart: {
      zooming: {
        type: "xy",
      },
      height: chartHeight,
      width: chartWidth,
    },
    title: {
      text: "Average Monthly Weather Data for Tokyo",
    },
    subtitle: {
      text: "Source: WorldClimate.com",
    },
    xAxis: [
      {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        crosshair: true,
      },
    ],
    yAxis: [
      {
        // Primary yAxis
        labels: {
          format: "{value}°C",
          style: {
            color: Highcharts.getOptions().colors?.[2] ?? "#000000",
          },
        },
        title: {
          text: "Temperature",
          style: {
            color: Highcharts.getOptions().colors?.[2] ?? "#000000",
          },
        },
        opposite: true,
      },
      {
        // Secondary yAxis
        gridLineWidth: 0,
        title: {
          text: "Rainfall",
          style: {
            color: Highcharts.getOptions().colors?.[0] ?? "#000000",
          },
        },
        labels: {
          format: "{value} mm",
          style: {
            color: Highcharts.getOptions().colors?.[0] ?? "#000000",
          },
        },
      },
      {
        // Tertiary yAxis
        gridLineWidth: 0,
        title: {
          text: "Sea-Level Pressure",
          style: {
            color: Highcharts.getOptions().colors?.[1] ?? "#000000",
          },
        },
        labels: {
          format: "{value} mb",
          style: {
            color: Highcharts.getOptions().colors?.[1] ?? "#000000",
          },
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
    },
    legend: {
      layout: "vertical",
      align: "left",
      x: 80,
      verticalAlign: "top",
      y: 55,
      floating: true,
      backgroundColor:
        Highcharts.defaultOptions.legend?.backgroundColor ??
        "rgba(255,255,255,0.25)", // theme
    },
    series: [
      {
        name: "Rainfall",
        type: "column",
        yAxis: 1,
        data: [
          49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1,
          95.6, 54.4,
        ],
        tooltip: {
          valueSuffix: " mm",
        },
      },
      {
        name: "Sea-Level Pressure",
        type: "spline",
        yAxis: 2,
        data: [
          1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1,
          1016.9, 1018.2, 1016.7,
        ],
        marker: {
          enabled: false,
        },
        dashStyle: "shortdot",
        tooltip: {
          valueSuffix: " mb",
        },
      },
      {
        name: "Temperature",
        type: "spline",
        data: [
          7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6,
        ],
        tooltip: {
          valueSuffix: " °C",
        },
      },
    ],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              floating: false,
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
              x: 0,
              y: 0,
            },
            yAxis: [
              {
                labels: {
                  align: "right",
                  x: 0,
                  y: -6,
                },
                showLastLabel: false,
              },
              {
                labels: {
                  align: "left",
                  x: 0,
                  y: -6,
                },
                showLastLabel: false,
              },
              {
                visible: false,
              },
            ],
          },
        },
      ],
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default WeatherChart;

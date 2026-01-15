import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

export default function FlowerStockByColorPie() {
  const [chartData, setChartData] = useState({
    labels: [],
    series: [],
    colors: [],
  });

  const FLOWER_COLOR_MAP = {
    red: "#e74c3c",
    yellow: "#f1c40f",
    purple: "#9b59b6",
    pink: "#fd79a8",
    white: "#ecf0f1",
    orange: "#e67e22",
    blue: "#3498db",
  };

  useEffect(() => {
    fetch("/api/flowers")
      .then((res) => res.json())
      .then((data) => {
        const grouped = data.reduce((acc, f) => {
          acc[f.color.toLowerCase()] =
            (acc[f.color.toLowerCase()] || 0) + f.stock_quantity;
          return acc;
        }, {});

        const labels = Object.keys(grouped);
        const series = Object.values(grouped);
        const colors = labels.map(
          (c) => FLOWER_COLOR_MAP[c] || "#95a5a6" // fallback
        );

        setChartData({ labels, series, colors });
      });
  }, []);

  const options = {
    labels: chartData.labels,
    colors: chartData.colors,
    title: {
      text: "Flower Stock Distribution by Color",
      align: "center",
    },
    legend: {
      position: "bottom",
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <Chart
          options={options}
          series={chartData.series}
          type="pie"
          height={350}
        />
      </div>
    </div>
  );
}

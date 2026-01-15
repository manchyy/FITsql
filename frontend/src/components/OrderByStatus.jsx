import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const STATUS_COLORS = {
  pending: "#f39c12",
  shipped: "#3498db",
  delivered: "#2ecc71",
  cancelled: "#e74c3c",
};

export default function OrdersByStatusOverTime() {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders) => {
        const grouped = {};
        const statusSet = new Set();

        orders.forEach((o) => {
          const date = new Date(o.order_date).toISOString().slice(0, 10); // YYYY-MM-DD

          const status = o.status.toLowerCase();
          statusSet.add(status);

          if (!grouped[date]) grouped[date] = {};
          grouped[date][status] = (grouped[date][status] || 0) + 1;
        });

        const dates = Object.keys(grouped).sort();

        const seriesData = [...statusSet].map((status) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          data: dates.map((d) => grouped[d][status] || 0),
        }));

        setCategories(dates);
        setSeries(seriesData);
      });
  }, []);

  const options = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
    },
    xaxis: {
      categories,
      title: { text: "Date" },
    },
    yaxis: {
      title: { text: "Orders" },
      allowDecimals: false,
    },
    title: {
      text: "Orders Over Time by Status",
      align: "center",
    },
    colors: series.map((s) => STATUS_COLORS[s.name.toLowerCase()] || "#95a5a6"),
    legend: {
      position: "top",
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <Chart options={options} series={series} type="line" height={380} />
      </div>
    </div>
  );
}

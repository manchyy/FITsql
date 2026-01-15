import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

export default function FlowerStockBar() {
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    fetch("/api/flowers")
      .then((res) => res.json())
      .then(setFlowers);
  }, []);

  const series = [
    {
      name: "Stock",
      data: flowers.map((f) => f.stock_quantity),
    },
  ];

  const options = {
    chart: { type: "bar" },
    title: {
      text: "Flower Stock",
      align: "center",
    },
    xaxis: {
      categories: flowers.map((f) => f.flower_name),
    },
  };

  return (
    <div className="card ">
      <div className="card-body">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
}

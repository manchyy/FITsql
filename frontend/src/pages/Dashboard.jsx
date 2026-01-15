import FlowerStockBar from "../components/FlowerStockBar";
import FlowerStockPie from "../components/FlowerStockPie";
import OrdersByStatusOverTime from "../components/OrderByStatus";

export default function Dashboard() {
  return (
    <>
      <h1 className="mb-4">Petal Pushers Admin Dashboard</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <FlowerStockBar />
        </div>

        <div className="col-md-6">
          <FlowerStockPie />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <OrdersByStatusOverTime />
        </div>
      </div>

      {/* <div className="card">
        <div className="card-body text-center">
          <img
            src="https://img.freepik.com/free-photo/pretty-florist-posing-with-bouquet_23-2147762236.jpg"
            className="img-fluid rounded"
            alt="Florist"
          />
        </div>
      </div> */}
    </>
  );
}

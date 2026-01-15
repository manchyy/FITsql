import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [arrangements, setArrangements] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    flower_id: "",
    flower_qty: "",
    arrangement_id: "",
    arrangement_qty: "",
    status: "Shipped",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchOrders = async () =>
    setOrders(await (await fetch("/api/orders")).json());
  const fetchCustomers = async () =>
    setCustomers(await (await fetch("/api/customers")).json());
  const fetchFlowers = async () =>
    setFlowers(await (await fetch("/api/flowers")).json());
  const fetchArrangements = async () =>
    setArrangements(await (await fetch("/api/arrangements")).json());

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchFlowers();
    fetchArrangements();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const buildItemsArray = () => {
    const items = [];
    if (formData.flower_id && Number(formData.flower_qty) > 0) {
      items.push({
        item_type: "flower",
        item_id: Number(formData.flower_id),
        quantity: Number(formData.flower_qty),
      });
    }
    if (formData.arrangement_id && Number(formData.arrangement_qty) > 0) {
      items.push({
        item_type: "arrangement",
        item_id: Number(formData.arrangement_id),
        quantity: Number(formData.arrangement_qty),
      });
    }
    return items;
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const items = buildItemsArray();
    if (!formData.customer_id || items.length === 0) return;

    const payload = {
      customer_id: Number(formData.customer_id),
      items,
      status: formData.status,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/orders/${editingId}` : "/api/orders";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setFormData({
      customer_id: "",
      flower_id: "",
      flower_qty: "",
      arrangement_id: "",
      arrangement_qty: "",
      status: "Shipped",
    });
    fetchOrders();
  };

  const handleEdit = (o) => {
    setEditingId(o.order_id);
    const flowerItem = o.items?.find((i) => i.item_type === "flower");
    const arrangementItem = o.items?.find((i) => i.item_type === "arrangement");
    setFormData({
      customer_id: o.customer_id,
      flower_id: flowerItem?.item_id || "",
      flower_qty: flowerItem?.quantity || "",
      arrangement_id: arrangementItem?.item_id || "",
      arrangement_qty: arrangementItem?.quantity || "",
      status: o.status,
    });
  };

  const handleDelete = async (id) => {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    fetchOrders();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Orders</h2>

      <form onSubmit={handleAddOrUpdate} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col">
            <label className="form-label">Customer</label>
            <select
              className="form-select"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label className="form-label">Flower</label>
            <select
              className="form-select"
              name="flower_id"
              value={formData.flower_id}
              onChange={handleChange}
            >
              <option value="">Select Flower</option>
              {flowers.map((f) => (
                <option key={f.flower_id} value={f.flower_id}>
                  {f.flower_name} (€{f.price})
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label className="form-label">Qty</label>
            <input
              type="number"
              className="form-control"
              name="flower_qty"
              value={formData.flower_qty}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Arrangement</label>
            <select
              className="form-select"
              name="arrangement_id"
              value={formData.arrangement_id}
              onChange={handleChange}
            >
              <option value="">Select Arrangement</option>
              {arrangements.map((a) => (
                <option key={a.arrangement_id} value={a.arrangement_id}>
                  {a.arrangement_name} (€{a.price})
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label className="form-label">Qty</label>
            <input
              type="number"
              className="form-control"
              name="arrangement_qty"
              value={formData.arrangement_qty}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-auto">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </div>
      </form>

      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Items Ordered</th>
            <th>Total Price (€)</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.order_id}>
              <td>{o.order_id}</td>
              <td>{o.customer_name}</td>
              <td>
                <ul className="mb-0 list-unstyled">
                  {o.items?.map((i, idx) => (
                    <li key={idx}>
                      {i.item_type === "flower"
                        ? flowers.find((f) => f.flower_id === i.item_id)
                            ?.flower_name
                        : arrangements.find(
                            (a) => a.arrangement_id === i.item_id
                          )?.arrangement_name}{" "}
                      x {i.quantity}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{o.total_price}</td>
              <td>{o.status}</td>
              <td>{new Date(o.order_date).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(o)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(o.order_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

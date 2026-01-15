import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function FlowersPage() {
  const [flowers, setFlowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    flower_name: "",
    color: "",
    price: "",
    stock_quantity: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchFlowers = async () => {
    const res = await fetch("/api/flowers");
    setFlowers(await res.json());
  };

  useEffect(() => {
    fetchFlowers();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.flower_name || !formData.color || !formData.price) return;

    const payload = {
      flower_name: formData.flower_name,
      color: formData.color,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/flowers/${editingId}` : "/api/flowers";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setFormData({ flower_name: "", color: "", price: "", stock_quantity: "" });
    fetchFlowers();
  };

  const handleEdit = (f) => {
    setEditingId(f.flower_id);
    setFormData({
      flower_name: f.flower_name,
      color: f.color,
      price: f.price,
      stock_quantity: f.stock_quantity,
    });
  };

  const handleDelete = async (id) => {
    await fetch(`/api/flowers/${id}`, { method: "DELETE" });
    fetchFlowers();
  };

  const filteredFlowers = flowers.filter(
    (f) =>
      f.flower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Flowers</h2>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name or color..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <form onSubmit={handleAddOrUpdate} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="flower_name"
              value={formData.flower_name}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Color</label>
            <input
              type="text"
              className="form-control"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Price (€)</label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Stock</label>
            <input
              type="number"
              className="form-control"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
            />
          </div>

          <div className="col-auto">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Add"}
            </button>
          </div>

          {editingId && (
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    flower_name: "",
                    color: "",
                    price: "",
                    stock_quantity: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>

      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Color</th>
            <th>Price (€)</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlowers.map((f) => (
            <tr key={f.flower_id}>
              <td>{f.flower_id}</td>
              <td>{f.flower_name}</td>
              <td>{f.color}</td>
              <td>{f.price.toFixed(2)}</td>
              <td>{f.stock_quantity}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(f)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(f.flower_id)}
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

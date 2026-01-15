import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ArrangementsPage() {
  const [arrangements, setArrangements] = useState([]);
  const [formData, setFormData] = useState({
    arrangement_name: "",
    description: "",
    price: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchArrangements = async () => {
    const res = await fetch("/api/arrangements");
    setArrangements(await res.json());
  };

  useEffect(() => {
    fetchArrangements();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.arrangement_name || !formData.price) return;

    const payload = {
      arrangement_name: formData.arrangement_name,
      description: formData.description,
      price: parseFloat(formData.price),
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/arrangements/${editingId}`
      : "/api/arrangements";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setFormData({ arrangement_name: "", description: "", price: "" });
    fetchArrangements();
  };

  const handleEdit = (arr) => {
    setEditingId(arr.arrangement_id);
    setFormData({
      arrangement_name: arr.arrangement_name,
      description: arr.description || "",
      price: arr.price,
    });
  };

  const handleDelete = async (id) => {
    await fetch(`/api/arrangements/${id}`, { method: "DELETE" });
    fetchArrangements();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Arrangements</h2>

      <form onSubmit={handleAddOrUpdate} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="arrangement_name"
              value={formData.arrangement_name}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              name="description"
              value={formData.description}
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
                    arrangement_name: "",
                    description: "",
                    price: "",
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
            <th>Description</th>
            <th>Price (€)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {arrangements.map((arr) => (
            <tr key={arr.arrangement_id}>
              <td>{arr.arrangement_id}</td>
              <td>{arr.arrangement_name}</td>
              <td>{arr.description}</td>
              <td>{arr.price.toFixed(2)}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(arr)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(arr.arrangement_id)}
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

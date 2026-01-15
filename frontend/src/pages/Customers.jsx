import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email_address: "",
    home_address: "",
    phone_number: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchCustomers = async () => {
    const res = await fetch("/api/customers");
    setCustomers(await res.json());
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email_address) return;

    const payload = {
      full_name: formData.full_name,
      email_address: formData.email_address,
      home_address: formData.home_address,
      phone_number: formData.phone_number,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/customers/${editingId}` : "/api/customers";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setFormData({
      full_name: "",
      email_address: "",
      home_address: "",
      phone_number: "",
    });
    fetchCustomers();
  };

  const handleEdit = (c) => {
    setEditingId(c.customer_id);
    setFormData({
      full_name: c.full_name,
      email_address: c.email_address,
      home_address: c.home_address || "",
      phone_number: c.phone_number || "",
    });
  };

  const handleDelete = async (id) => {
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Customers</h2>

      <form onSubmit={handleAddOrUpdate} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email_address"
              value={formData.email_address}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              name="home_address"
              value={formData.home_address}
              onChange={handleChange}
            />
          </div>

          <div className="col">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              name="phone_number"
              value={formData.phone_number}
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
                    full_name: "",
                    email_address: "",
                    home_address: "",
                    phone_number: "",
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
            <th>Full Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.customer_id}>
              <td>{c.customer_id}</td>
              <td>{c.full_name}</td>
              <td>{c.email_address}</td>
              <td>{c.home_address}</td>
              <td>{c.phone_number}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(c)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(c.customer_id)}
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

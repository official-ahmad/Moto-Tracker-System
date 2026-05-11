import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";

export default function MaintenanceForm({ onSuccess, bike }) {
  const today = new Date().toISOString().split("T")[0];
  const [type, setType] = useState("oil-change");
  const [formData, setFormData] = useState({
    cost: "",
    reading: "",
    date: today,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cost || !formData.reading || !formData.date) {
      setError("Please fill in all fields");
      return;
    }

    if (isNaN(formData.cost) || isNaN(formData.reading)) {
      setError("Please enter valid numbers");
      return;
    }

    setLoading(true);
    try {
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(12, 0, 0, 0);

      await addDoc(
        collection(db, "users", auth.currentUser.uid, "maintenance"),
        {
          bikeName: bike.bikeName,
          type: type,
          cost: parseFloat(formData.cost),
          reading: parseFloat(formData.reading),
          timestamp: selectedDate,
        },
      );

      setFormData({ cost: "", reading: "", date: today });
      setType("oil-change");
      toast.success("Maintenance log added! 🔧", { duration: 2000 });
      onSuccess?.();
    } catch (err) {
      setError("Failed to save maintenance log: " + err.message);
      console.error("Error adding document:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 rounded-lg p-6 border border-slate-700"
    >
      <h2 className="text-xl font-bold text-white mb-2">🔧 Maintenance Log</h2>
      <p className="text-sm text-purple-300 mb-4">Bike: {bike.bikeName}</p>

      {error && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Service Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value="oil-change">🛢️ Oil Change</option>
          <option value="tuning">⚙️ Tuning</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Cost (₹)
          </label>
          <input
            type="number"
            name="cost"
            step="0.01"
            value={formData.cost}
            onChange={handleChange}
            placeholder="500"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Reading (km)
          </label>
          <input
            type="number"
            name="reading"
            step="1"
            value={formData.reading}
            onChange={handleChange}
            placeholder="12500"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-slate-300 text-sm font-medium mb-2">
          📅 Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
      >
        {loading ? "⏳ Saving..." : "➕ Add Maintenance"}
      </button>
    </form>
  );
}

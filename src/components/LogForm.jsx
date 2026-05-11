import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";

export default function LogForm({ onSuccess, bike }) {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    amount: "",
    liters: "",
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

    if (
      !formData.amount ||
      !formData.liters ||
      !formData.reading ||
      !formData.date
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (
      isNaN(formData.amount) ||
      isNaN(formData.liters) ||
      isNaN(formData.reading)
    ) {
      setError("Please enter valid numbers");
      return;
    }

    setLoading(true);
    try {
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(12, 0, 0, 0);

      await addDoc(collection(db, "users", auth.currentUser.uid, "logs"), {
        bikeName: bike.bikeName,
        riderName: bike.riderName,
        ownerName: bike.ownerName,
        amount: parseFloat(formData.amount),
        liters: parseFloat(formData.liters),
        reading: parseFloat(formData.reading),
        timestamp: selectedDate,
      });

      setFormData({ amount: "", liters: "", reading: "", date: today });
      toast.success("Fuel log added! ⛽", { duration: 2000 });
      onSuccess?.();
    } catch (err) {
      setError("Failed to save log: " + err.message);
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
      <h2 className="text-xl font-bold text-white mb-2">Add Fuel Log</h2>
      <p className="text-sm text-blue-300 mb-4">Bike: {bike.bikeName}</p>

      {error && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="500"
            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Liters (L)
          </label>
          <input
            type="number"
            name="liters"
            step="0.01"
            value={formData.liters}
            onChange={handleChange}
            placeholder="10"
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
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
      >
        {loading ? "⏳ Saving..." : "➕ Add Log"}
      </button>
    </form>
  );
}

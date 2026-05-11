import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";

export default function BikeRegistration({ onSuccess }) {
  const [formData, setFormData] = useState({
    bikeName: "",
    riderName: "",
    ownerName: "",
    bikeModel: "",
    registrationNumber: "",
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

    if (!formData.bikeName || !formData.riderName || !formData.ownerName) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "bikes"), {
        bikeName: formData.bikeName.trim(),
        riderName: formData.riderName.trim(),
        ownerName: formData.ownerName.trim(),
        bikeModel: formData.bikeModel.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        createdAt: new Date(),
        isActive: true,
      });

      setFormData({
        bikeName: "",
        riderName: "",
        ownerName: "",
        bikeModel: "",
        registrationNumber: "",
      });

      toast.success("Bike registered successfully! 🏍️", { duration: 2000 });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      toast.error("Failed to register bike", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span>🏍️</span> Register Your Bike
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bike Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bike Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bikeName"
              value={formData.bikeName}
              onChange={handleChange}
              placeholder="e.g., My Hero Honda"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Rider Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rider Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="riderName"
              value={formData.riderName}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Owner name"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Bike Model */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bike Model
            </label>
            <input
              type="text"
              name="bikeModel"
              value={formData.bikeModel}
              onChange={handleChange}
              placeholder="e.g., Hero Honda CB Shine"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Registration Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g., DL-01-AB-1234"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {loading ? "Registering..." : "Register Bike"}
        </button>
      </form>
    </div>
  );
}

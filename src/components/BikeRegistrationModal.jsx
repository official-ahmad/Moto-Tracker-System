import { useState } from "react";
import toast from "react-hot-toast";

export default function BikeRegistrationModal({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    bikeName: "",
    riderName: "",
    ownerName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bikeName || !formData.riderName || !formData.ownerName) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    const success = await onSuccess(formData);
    setLoading(false);

    if (success) {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🏍️</span> Register Your Bike
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
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
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
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
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all"
          >
            {loading ? "Registering..." : "Register Bike"}
          </button>
        </form>
      </div>
    </div>
  );
}

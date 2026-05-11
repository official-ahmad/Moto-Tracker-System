import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import PrintSlip from "./PrintSlip";

export default function MaintenanceList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);
  const [editFormData, setEditFormData] = useState({
    cost: "",
    reading: "",
    date: "",
  });

  useEffect(() => {
    const q = query(
      collection(db, "users", auth.currentUser.uid, "maintenance"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const logsData = [];
        querySnapshot.forEach((doc) => {
          logsData.push({ id: doc.id, ...doc.data() });
        });
        setLogs(logsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching maintenance logs:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleDelete = async (logId) => {
    setDeletingId(logId);
    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "maintenance", logId)
      );
      toast.success("Maintenance log deleted successfully! 🗑️", {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("Failed to delete log");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (log) => {
    setEditingId(log.id);
    const date = new Date(log.timestamp.seconds * 1000)
      .toISOString()
      .split("T")[0];
    setEditFormData({
      cost: log.cost,
      reading: log.reading,
      date: date,
    });
  };

  const handleSaveEdit = async () => {
    if (!editFormData.cost || !editFormData.reading || !editFormData.date) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const selectedDate = new Date(editFormData.date);
      selectedDate.setHours(12, 0, 0, 0);

      await updateDoc(
        doc(db, "users", auth.currentUser.uid, "maintenance", editingId),
        {
          cost: parseFloat(editFormData.cost),
          reading: parseFloat(editFormData.reading),
          timestamp: selectedDate,
        }
      );
      toast.success("Maintenance log updated successfully! ✏️", {
        duration: 2000,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating log:", error);
      toast.error("Failed to update log");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ cost: "", reading: "", date: "" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getServiceIcon = (type) => {
    return type === "oil-change" ? "🛢️" : "⚙️";
  };

  const getServiceName = (type) => {
    return type === "oil-change" ? "Oil Change" : "Tuning";
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">🔧 Maintenance Logs</h2>
        <div className="text-center text-slate-400">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🔧 Maintenance Logs</h2>
        {logs.length > 0 && (
          <button
            onClick={() => setShowPrintSlip(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            🖨️ Print Slip
          </button>
        )}
      </div>

      {showPrintSlip && (
        <PrintSlip
          logs={logs}
          type="maintenance"
          onClose={() => setShowPrintSlip(false)}
        />
      )}

      {logs.length === 0 ? (
        <div className="text-center text-slate-400">
          No maintenance logs yet. Add your first service entry!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-300 font-semibold">
                  Type
                </th>
                <th className="text-left py-2 px-2 text-slate-300 font-semibold">
                  Date
                </th>
                <th className="text-right py-2 px-2 text-slate-300 font-semibold">
                  Cost (₹)
                </th>
                <th className="text-right py-2 px-2 text-slate-300 font-semibold">
                  Reading (km)
                </th>
                <th className="text-center py-2 px-2 text-slate-300 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isEditing = editingId === log.id;

                if (isEditing) {
                  return (
                    <tr key={log.id} className="border-b border-slate-700 bg-slate-700">
                      <td className="py-3 px-2">
                        {getServiceIcon(log.type)} {getServiceName(log.type)}
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              date: e.target.value,
                            })
                          }
                          className="w-full bg-slate-600 text-white px-2 py-1 rounded text-xs"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.cost}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              cost: e.target.value,
                            })
                          }
                          className="w-full bg-slate-600 text-white px-2 py-1 rounded text-xs"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={editFormData.reading}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              reading: e.target.value,
                            })
                          }
                          className="w-full bg-slate-600 text-white px-2 py-1 rounded text-xs"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-md text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white rounded-md text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={log.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50"
                  >
                    <td className="py-3 px-2 text-slate-300">
                      {getServiceIcon(log.type)} {getServiceName(log.type)}
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-2 text-right text-white">
                      ₹{log.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-white">
                      {log.reading}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(log)}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-md text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-md text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {deletingId === log.id ? " Deleting..." : " Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

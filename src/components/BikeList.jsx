import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";

export default function BikeList({ refreshKey }) {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, "users", auth.currentUser.uid, "bikes"),
      where("isActive", "==", true),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bikesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBikes(bikesList);
      setLoading(false);

      // Auto-select first bike if available
      if (bikesList.length > 0 && !selectedBike) {
        setSelectedBike(bikesList[0].id);
      }
    });

    return unsubscribe;
  }, [refreshKey, selectedBike]);

  const handleDeleteBike = async (bikeId) => {
    if (window.confirm("Are you sure you want to delete this bike?")) {
      try {
        await deleteDoc(
          doc(db, "users", auth.currentUser.uid, "bikes", bikeId),
        );
        toast.success("Bike deleted successfully", { duration: 2000 });
        setSelectedBike(null);
      } catch (error) {
        toast.error("Failed to delete bike", { duration: 2000 });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 text-center text-slate-400">
        Loading bikes...
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">
          No bikes registered yet. Register one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span>🏍️</span> My Bikes
      </h2>

      <div className="space-y-4">
        {bikes.map((bike) => (
          <div
            key={bike.id}
            onClick={() => setSelectedBike(bike.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedBike === bike.id
                ? "border-blue-500 bg-blue-900/20"
                : "border-slate-700 bg-slate-700 hover:bg-slate-600"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {bike.bikeName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-400">Rider:</span>{" "}
                    {bike.riderName}
                  </div>
                  <div>
                    <span className="text-slate-400">Owner:</span>{" "}
                    {bike.ownerName}
                  </div>
                  {bike.bikeModel && (
                    <div>
                      <span className="text-slate-400">Model:</span>{" "}
                      {bike.bikeModel}
                    </div>
                  )}
                  {bike.registrationNumber && (
                    <div>
                      <span className="text-slate-400">Reg:</span>{" "}
                      {bike.registrationNumber}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBike(bike.id);
                }}
                className="ml-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

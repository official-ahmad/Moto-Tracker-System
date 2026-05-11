import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Stats() {
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalLiters: 0,
    avgPerLiter: 0,
    avgPerTrip: 0,
    tripCount: 0,
  });

  useEffect(() => {
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'logs'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let totalSpent = 0;
      let totalLiters = 0;
      let tripCount = 0;

      querySnapshot.forEach((doc) => {
        const log = doc.data();
        totalSpent += log.amount;
        totalLiters += log.liters;
        tripCount += 1;
      });

      const avgPerLiter = totalLiters > 0 ? (totalSpent / totalLiters).toFixed(2) : 0;
      const avgPerTrip = tripCount > 0 ? (totalSpent / tripCount).toFixed(2) : 0;

      setStats({
        totalSpent: totalSpent.toFixed(2),
        totalLiters: totalLiters.toFixed(2),
        avgPerLiter,
        avgPerTrip,
        tripCount,
      });
    });

    return unsubscribe;
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Total Spent</p>
        <p className="text-2xl font-bold text-blue-400">₹{stats.totalSpent}</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Total Liters</p>
        <p className="text-2xl font-bold text-green-400">{stats.totalLiters}</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Trips</p>
        <p className="text-2xl font-bold text-purple-400">{stats.tripCount}</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Avg ₹/Liter</p>
        <p className="text-2xl font-bold text-orange-400">{stats.avgPerLiter}</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Avg per Trip</p>
        <p className="text-2xl font-bold text-cyan-400">₹{stats.avgPerTrip}</p>
      </div>
    </div>
  );
}
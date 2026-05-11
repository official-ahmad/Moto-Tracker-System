#!/usr/bin/env node

import fs from "fs";

// Ensure directories exist
const dirs = ["./src/components", "./src/hooks"];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// File creation map
const files = {
  "./src/hooks/useAuth.js": `import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, loading, logout };
};`,
  "./src/components/Login.jsx": `import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('Failed to sign in: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          🏍️ Bike Petrol Tracker
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Track your fuel expenses across all devices
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-slate-500 text-center text-sm mt-6">
          Secure login powered by Google. Your data is encrypted and private.
        </p>
      </div>
    </div>
  );
}`,
  "./src/components/LogForm.jsx": `import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function LogForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    liters: '',
    reading: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.liters || !formData.reading) {
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(formData.amount) || isNaN(formData.liters) || isNaN(formData.reading)) {
      setError('Please enter valid numbers');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'logs'), {
        amount: parseFloat(formData.amount),
        liters: parseFloat(formData.liters),
        reading: parseFloat(formData.reading),
        timestamp: serverTimestamp(),
      });

      setFormData({ amount: '', liters: '', reading: '' });
      onSuccess?.();
    } catch (err) {
      setError('Failed to save log: ' + err.message);
      console.error('Error adding document:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Add Fuel Log</h2>

      {error && <div className="bg-red-900/30 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}

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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded transition-colors"
      >
        {loading ? 'Saving...' : 'Add Log'}
      </button>
    </form>
  );
}`,
  "./src/components/LogsList.jsx": `import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function LogsList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'logs'),
      orderBy('timestamp', 'desc')
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
        console.error('Error fetching logs:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleDelete = async (logId) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    setDeletingId(logId);
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'logs', logId));
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Fuel Logs</h2>
        <div className="text-center text-slate-400">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-4">Fuel Logs</h2>

      {logs.length === 0 ? (
        <div className="text-center text-slate-400">No logs yet. Add your first fuel entry!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-300 font-semibold">Date</th>
                <th className="text-right py-2 px-2 text-slate-300 font-semibold">Amount (₹)</th>
                <th className="text-right py-2 px-2 text-slate-300 font-semibold">Liters</th>
                <th className="text-right py-2 px-2 text-slate-300 font-semibold">Reading (km)</th>
                <th className="text-right py-2 px-2 text-slate-300 font-semibold">₹/L</th>
                <th className="text-center py-2 px-2 text-slate-300 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const pricePerLiter = (log.amount / log.liters).toFixed(2);
                return (
                  <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-2 text-slate-300">{formatDate(log.timestamp)}</td>
                    <td className="py-3 px-2 text-right text-white">₹{log.amount.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-white">{log.liters.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-white">{log.reading}</td>
                    <td className="py-3 px-2 text-right text-blue-400">{pricePerLiter}</td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        className="text-red-400 hover:text-red-300 disabled:text-slate-500 transition-colors text-xs"
                      >
                        {deletingId === log.id ? 'Deleting...' : 'Delete'}
                      </button>
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
}`,
  "./src/components/Stats.jsx": `import { useEffect, useState } from 'react';
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
}`,
  "./src/components/Dashboard.jsx": `import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LogForm from './LogForm';
import LogsList from './LogsList';
import Stats from './Stats';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🏍️ Bike Petrol Tracker</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              {user?.displayName || user?.email}
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Statistics</h2>
          <Stats key={refreshKey} />
        </div>

        {/* Form and Logs - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form - Sidebar on desktop, top on mobile */}
          <div className="lg:col-span-1">
            <LogForm onSuccess={handleLogAdded} />
          </div>

          {/* Logs List - Full width on mobile */}
          <div className="lg:col-span-2">
            <LogsList key={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}`,
};

// Create files
Object.entries(files).forEach(([filePath, content]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created file: ${filePath}`);
  } else {
    console.log(`File already exists (skipping): ${filePath}`);
  }
});

console.log("\\n✅ Setup complete! Files created successfully.");
console.log("\\n📦 Next steps:");
console.log("1. Run: npm install firebase react-firebase-hooks");
console.log("2. Create .env.local with your Firebase credentials");
console.log("3. Run: npm run dev");

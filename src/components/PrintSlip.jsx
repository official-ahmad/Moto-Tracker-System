import { useRef } from "react";

export default function PrintSlip({ logs, type, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getServiceIcon = (serviceType) => {
    return serviceType === "oil-change" ? "🛢️" : "⚙️";
  };

  const getServiceName = (serviceType) => {
    return serviceType === "oil-change" ? "Oil Change" : "Tuning";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {type === "fuel" ? "⛽ Fuel Logs Slip" : "🔧 Maintenance Slip"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:bg-white/20 w-8 h-8 rounded flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div ref={printRef} className="p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">🏍️ MOTO-RESOURCES</h1>
            <p className="text-slate-600 mt-2">Bike Maintenance & Fuel Tracker</p>
            <p className="text-sm text-slate-500 mt-4">
              Printed on: {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>

          {/* Slip Type */}
          <div className="mb-6 pb-6 border-b-2 border-slate-300">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {type === "fuel" ? "⛽ FUEL LOGS" : "🔧 MAINTENANCE RECORDS"}
            </h2>
          </div>

          {/* Table */}
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-slate-800">
                {type === "fuel" ? (
                  <>
                    <th className="text-left py-3 px-2 font-bold text-slate-800">Date</th>
                    <th className="text-right py-3 px-2 font-bold text-slate-800">Amount (₹)</th>
                    <th className="text-right py-3 px-2 font-bold text-slate-800">Liters</th>
                    <th className="text-right py-3 px-2 font-bold text-slate-800">Reading (km)</th>
                    <th className="text-right py-3 px-2 font-bold text-slate-800">₹/L</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-2 font-bold text-slate-800">Type</th>
                    <th className="text-left py-3 px-2 font-bold text-slate-800">Date</th>
                    <th className="text-right py-3 px-2 font-bold text-slate-800">Cost (₹)</th>
                    <th className="text-right py-3 px-2 font-bold text-slate-800">Reading (km)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                if (type === "fuel") {
                  const pricePerLiter = (log.amount / log.liters).toFixed(2);
                  return (
                    <tr key={index} className="border-b border-slate-300">
                      <td className="py-2 px-2 text-slate-800">{formatDate(log.timestamp)}</td>
                      <td className="py-2 px-2 text-right text-slate-800">
                        ₹{log.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-800">
                        {log.liters.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-800">{log.reading}</td>
                      <td className="py-2 px-2 text-right text-slate-800">{pricePerLiter}</td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={index} className="border-b border-slate-300">
                      <td className="py-2 px-2 text-slate-800">
                        {getServiceIcon(log.type)} {getServiceName(log.type)}
                      </td>
                      <td className="py-2 px-2 text-slate-800">{formatDate(log.timestamp)}</td>
                      <td className="py-2 px-2 text-right text-slate-800">
                        ₹{log.cost.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-800">{log.reading}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>

          {/* Summary */}
          <div className="bg-slate-100 p-4 rounded mb-8">
            <p className="text-sm text-slate-700">
              <strong>Total Records:</strong> {logs.length}
            </p>
            {type === "fuel" && (
              <>
                <p className="text-sm text-slate-700 mt-1">
                  <strong>Total Cost:</strong> ₹
                  {logs.reduce((sum, log) => sum + log.amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  <strong>Total Liters:</strong> {logs.reduce((sum, log) => sum + log.liters, 0).toFixed(2)} L
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  <strong>Avg Cost/Liter:</strong> ₹
                  {(
                    logs.reduce((sum, log) => sum + log.amount, 0) /
                    logs.reduce((sum, log) => sum + log.liters, 0)
                  ).toFixed(2)}
                </p>
              </>
            )}
            {type === "maintenance" && (
              <p className="text-sm text-slate-700 mt-1">
                <strong>Total Maintenance Cost:</strong> ₹
                {logs.reduce((sum, log) => sum + log.cost, 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 border-t pt-4">
            <p>This is an auto-generated report from Moto-Resources Tracker</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-slate-100 p-4 flex gap-3 justify-center border-t">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            🖨️ Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

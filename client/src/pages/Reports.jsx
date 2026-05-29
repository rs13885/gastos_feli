import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fmt = (val) =>
  `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const downloadCSV = (expenses, filename) => {
  const BOM = '﻿';
  const headers = ['Fecha', 'Categoría', 'Item', 'Monto', 'Porcentaje (%)', 'Tu Parte'];
  const rows = expenses.map(e => [
    e.date,
    e.category,
    e.item,
    e.amount.toFixed(2),
    Math.round(e.percentage * 100),
    e.proportional.toFixed(2),
  ]);
  const csv = BOM + [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const Reports = ({ expenses }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/expenses`).then(r => setHistory(r.data)).catch(console.error);
  }, []);

  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      if (!map[e.category]) map[e.category] = { name: e.category, amount: 0, proportional: 0 };
      map[e.category].amount += e.amount;
      map[e.category].proportional += e.proportional;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const totalProportional = expenses.reduce((s, e) => s + e.proportional, 0);

  const historyStats = useMemo(() => {
    if (!history.length) return { total: 0, proportional: 0, average: 0, months: 0 };
    const total = history.reduce((s, e) => s + e.amount, 0);
    const proportional = history.reduce((s, e) => s + e.proportional, 0);
    const months = new Set(history.map(e => e.date.substring(0, 7))).size;
    return { total, proportional, average: months > 0 ? total / months : 0, months };
  }, [history]);

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* Historical stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Gasto Histórico Total</h3>
          <p className="text-3xl font-bold text-gray-800">{fmt(historyStats.total)}</p>
          <p className="text-xs text-gray-400 mt-1">{historyStats.months} meses registrados</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Promedio Mensual</h3>
          <p className="text-3xl font-bold text-gray-800">{fmt(historyStats.average)}</p>
          <p className="text-xs text-gray-400 mt-1">Gasto total por mes</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Tu Parte Histórica</h3>
            <p className="text-3xl font-bold text-pink-600">{fmt(historyStats.proportional)}</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => downloadCSV(history, 'gastos-historial.csv')}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-pink-600 transition-colors"
            >
              <Download size={13} />
              Descargar historial completo
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Month section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Mes Seleccionado</h2>
        {expenses.length > 0 && (
          <button
            onClick={() => downloadCSV(expenses, 'gastos-mes.csv')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
          >
            <Download size={15} />
            Descargar CSV
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No hay datos para el mes seleccionado.</p>
        </div>
      ) : (
        <>
          {/* Monthly summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Categoría Top</h3>
              <p className="text-2xl font-bold text-gray-800">{categoryData[0]?.name}</p>
              <p className="text-pink-600 font-medium text-sm mt-1">{fmt(categoryData[0]?.amount ?? 0)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total del Mes</h3>
              <p className="text-2xl font-bold text-gray-800">{fmt(totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">{expenses.length} gastos registrados</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Tu Parte del Mes</h3>
              <p className="text-2xl font-bold text-pink-600">{fmt(totalProportional)}</p>
            </div>
          </div>

          {/* Category breakdown table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Desglose por Categoría</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3 text-left">Categoría</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right hidden sm:table-cell">% del mes</th>
                  <th className="px-6 py-3 text-right">Tu Parte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categoryData.map(cat => (
                  <tr key={cat.name} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-400 flex-shrink-0" />
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 font-medium">{fmt(cat.amount)}</td>
                    <td className="px-6 py-4 text-right text-gray-400 text-sm hidden sm:table-cell">
                      {totalAmount > 0 ? ((cat.amount / totalAmount) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-pink-600">{fmt(cat.proportional)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-700">Total</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">{fmt(totalAmount)}</td>
                  <td className="hidden sm:table-cell" />
                  <td className="px-6 py-4 text-right font-black text-pink-600">{fmt(totalProportional)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

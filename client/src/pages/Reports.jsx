import React, { useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COLORS = ['#be185d', '#db2777', '#f472b6', '#fbcfe8', '#831843', '#500724'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                <p className="font-bold text-gray-800">{payload[0].name}</p>
                <p className="text-pink-600 font-medium">
                    ${payload[0].value.toLocaleString('es-AR')}
                </p>
            </div>
        );
    }
    return null;
};

const Reports = ({ expenses }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/expenses`)
            .then(res => setHistory(res.data))
            .catch(err => console.error(err));
    }, []);

    // Current Month Data
    const categoryData = useMemo(() => {
        const data = {};
        expenses.forEach(exp => {
            if (!data[exp.category]) {
                data[exp.category] = { name: exp.category, value: 0, proportional: 0 };
            }
            data[exp.category].value += exp.amount;
            data[exp.category].proportional += exp.proportional;
        });
        return Object.values(data).sort((a, b) => b.value - a.value);
    }, [expenses]);

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const maxCategory = categoryData.length > 0 ? categoryData[0] : null;

    // Historical Stats
    const historyStats = useMemo(() => {
        if (!history.length) return { total: 0, average: 0, months: 0 };

        const total = history.reduce((sum, e) => sum + e.amount, 0);

        // Count unique months
        const uniqueMonths = new Set(history.map(e => e.date.substring(0, 7))).size; // YYYY-MM
        const average = uniqueMonths > 0 ? total / uniqueMonths : 0;

        return { total, average, months: uniqueMonths };
    }, [history]);

    const formatCurrency = (val) => `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
        <div className="space-y-8 animate-fade-in-up">

            {/* Historical Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-pink-50 to-transparent pointer-events-none"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 z-10 relative">Gasto Histórico Total</h3>
                    <div className="relative z-10">
                        <p className="text-3xl font-bold text-gray-800">{formatCurrency(historyStats.total)}</p>
                        <p className="text-xs text-gray-400 mt-1">Acumulado en {historyStats.months} meses registrados</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-50 to-transparent pointer-events-none"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 z-10 relative">Promedio Mensual</h3>
                    <div className="relative z-10">
                        <p className="text-3xl font-bold text-gray-800">{formatCurrency(historyStats.average)}</p>
                        <p className="text-xs text-gray-400 mt-1">Promedio de gasto por mes</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <h2 className="text-lg font-semibold text-gray-700">Reporte del Mes Seleccionado</h2>

            {expenses.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">No hay datos para el mes seleccionado.</p>
                </div>
            ) : (
                <>
                    {/* Monthly Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Categoría Top (Mes)</h3>
                            {maxCategory ? (
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{maxCategory.name}</p>
                                    <p className="text-pink-600 font-medium">{formatCurrency(maxCategory.value)}</p>
                                    <p className="text-xs text-gray-400 mt-1">{((maxCategory.value / totalAmount) * 100).toFixed(1)}% del total mensual</p>
                                </div>
                            ) : <p>-</p>}
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total del Mes</h3>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount)}</p>
                                <p className="text-gray-500 font-medium text-sm mt-1">{expenses.length} gastos registrados</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 w-full text-left">Distribución por Categoría</h3>
                            <div className="flex-1 w-full h-[350px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Info Panel / Summary List */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Detalle por Categoría</h3>
                            <div className="space-y-4">
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">{formatCurrency(cat.value)}</p>
                                            <p className="text-xs text-gray-400 group-hover:text-gray-500">
                                                {((cat.value / totalAmount) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;

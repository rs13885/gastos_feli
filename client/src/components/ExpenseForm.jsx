import React, { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';

const CATEGORIES = ['Vivienda', 'Salud', 'Educación', 'Alimentos', 'Otros'];

const ExpenseForm = ({ onSave, initialData = null, onCancel, currentMonthDate }) => {
    const [formData, setFormData] = useState({
        date: initialData?.date || currentMonthDate ? new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: 'Vivienda',
        item: '',
        amount: '',
        percentage: 0.5,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date: initialData.date,
                amount: initialData.amount,
                percentage: initialData.percentage
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            amount: parseFloat(formData.amount),
            percentage: parseFloat(formData.percentage),
        });
        // Reset if not editing
        if (!initialData) {
            setFormData(prev => ({ ...prev, item: '', amount: '' }));
        }
    };

    const proportional = (parseFloat(formData.amount) || 0) * (parseFloat(formData.percentage) || 0);

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {initialData ? 'Editar Gasto' : 'Nuevo Gasto'}
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



                    {/* Category */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none appearance-none text-gray-800 font-medium cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Item */}
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item / Descripción</label>
                        <input
                            type="text"
                            name="item"
                            required
                            placeholder="Ej. Alquiler, Supermercado..."
                            value={formData.item}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium placeholder-gray-400"
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto Total</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400">$</span>
                            <input
                                type="number"
                                name="amount"
                                required
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none text-gray-800 font-bold"
                            />
                        </div>
                    </div>

                    {/* Percentage */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Porcentaje (Ej. 0.5)</label>
                        <input
                            type="number"
                            name="percentage"
                            required
                            step="0.01"
                            max="1"
                            min="-1"
                            value={formData.percentage}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
                        />
                    </div>
                </div>

                {/* Live Preview */}
                <div className="mt-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100 flex justify-between items-center">
                    <span className="text-sm text-pink-700 font-medium">Proporcional (Preview)</span>
                    <span className="text-2xl font-black text-pink-600 tracking-tight">
                        ${proportional.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 font-medium tracking-wide"
                    >
                        {initialData ? <Save size={18} /> : <Plus size={18} />}
                        {initialData ? 'Guardar Cambios' : 'Agregar Gasto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;

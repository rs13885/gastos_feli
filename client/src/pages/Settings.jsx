import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Settings = ({ onCategoriesChange }) => {
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ name: '', percentage: '' });
    const [newCategory, setNewCategory] = useState({ name: '', percentage: '70' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/categories`);
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${API_URL}/categories`, {
                name: newCategory.name.trim(),
                percentage: parseFloat(newCategory.percentage) / 100,
            });
            setNewCategory({ name: '', percentage: '70' });
            await fetchCategories();
            onCategoriesChange();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar');
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setEditValues({ name: cat.name, percentage: String(Math.round(cat.percentage * 100)) });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ name: '', percentage: '' });
    };

    const handleSaveEdit = async (id) => {
        setError('');
        try {
            await axios.put(`${API_URL}/categories/${id}`, {
                name: editValues.name.trim(),
                percentage: parseFloat(editValues.percentage) / 100,
            });
            setEditingId(null);
            await fetchCategories();
            onCategoriesChange();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await axios.delete(`${API_URL}/categories/${id}`);
            await fetchCategories();
            onCategoriesChange();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up max-w-xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Definí el porcentaje que cubrís por categoría. Al crear un gasto, se autocompletará según la categoría elegida.
                </p>
            </div>

            {/* Category list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Categorías</h3>
                </div>

                {categories.length === 0 ? (
                    <p className="text-gray-400 text-sm px-6 py-8 text-center">No hay categorías aún.</p>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {categories.map(cat => (
                            <li key={cat.id} className="px-6 py-4 flex items-center gap-4 group">
                                {editingId === cat.id ? (
                                    <>
                                        <input
                                            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium text-gray-800"
                                            value={editValues.name}
                                            onChange={e => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                        <div className="relative w-24">
                                            <input
                                                type="number"
                                                min="-100"
                                                max="100"
                                                step="1"
                                                className="w-full pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-bold text-gray-800"
                                                value={editValues.percentage}
                                                onChange={e => setEditValues(prev => ({ ...prev, percentage: e.target.value }))}
                                            />
                                            <span className="absolute right-2.5 top-1.5 text-gray-400 text-sm">%</span>
                                        </div>
                                        <button onClick={() => handleSaveEdit(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                                        <span className="text-sm font-bold text-pink-600 w-16 text-right">
                                            {Math.round(cat.percentage * 100)}%
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Add new category */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4">Nueva Categoría</h3>
                <form onSubmit={handleAdd} className="flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</label>
                        <input
                            required
                            placeholder="Ej. Transporte"
                            value={newCategory.name}
                            onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium text-gray-800 placeholder-gray-400"
                        />
                    </div>
                    <div className="w-28 space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tu %</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                min="-100"
                                max="100"
                                step="1"
                                value={newCategory.percentage}
                                onChange={e => setNewCategory(prev => ({ ...prev, percentage: e.target.value }))}
                                className="w-full pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-bold text-gray-800"
                            />
                            <span className="absolute right-2.5 top-2 text-gray-400 text-sm">%</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg shadow hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium text-sm"
                    >
                        <Plus size={16} />
                        Agregar
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>
        </div>
    );
};

export default Settings;

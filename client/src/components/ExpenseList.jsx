import React, { useMemo } from 'react';
import { Edit2, Trash2, DollarSign } from 'lucide-react';

const ExpenseList = ({ expenses, onEdit, onDelete }) => {

    // Group by Category
    const grouped = useMemo(() => {
        const groups = {};
        expenses.forEach(exp => {
            if (!groups[exp.category]) groups[exp.category] = [];
            groups[exp.category].push(exp);
        });
        return groups;
    }, [expenses]);

    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalProportional = expenses.reduce((sum, exp) => sum + parseFloat(exp.proportional), 0);

    return (
        <div className="space-y-8 animate-fade-in-up">
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">No hay gastos para este mes aún.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 tracking-wide flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                {category}
                            </h3>
                            <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
                                {items.length} item{items.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {items.map(expense => (
                                <div key={expense.id} className="p-4 hover:bg-pink-50/30 transition-colors grid grid-cols-12 gap-4 items-center group">
                                    <div className="col-span-5 md:col-span-4">
                                        <p className="font-medium text-gray-800">{expense.item}</p>
                                        <p className="text-xs text-gray-400 md:hidden">{new Date(expense.date).toLocaleDateString()}</p>
                                    </div>

                                    <div className="col-span-3 md:col-span-2 text-right">
                                        <p className="text-sm text-gray-500 font-medium">${expense.amount.toLocaleString('es-AR')}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest hidden md:block">Total</p>
                                    </div>

                                    <div className="col-span-2 md:col-span-2 text-center">
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                            {expense.percentage}
                                        </span>
                                    </div>

                                    <div className="col-span-2 md:col-span-2 text-right">
                                        <p className="font-bold text-pink-600">${expense.proportional.toLocaleString('es-AR')}</p>
                                        <p className="text-[10px] text-pink-300 uppercase tracking-widest hidden md:block">Tu Parte</p>
                                    </div>

                                    <div className="col-span-12 md:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all md:translate-x-2 group-hover:translate-x-0">
                                        <button
                                            onClick={() => onEdit(expense)}
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl p-6 relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col justify-center">
                        <h3 className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-1">Monto Total Mensual</h3>
                        <div className="flex items-baseline gap-1">
                            <DollarSign className="text-gray-500" size={20} />
                            <span className="text-3xl font-bold">{totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center md:items-end md:text-right border-t md:border-t-0 border-gray-700/50 pt-4 md:pt-0">
                        <h3 className="text-pink-300 font-medium uppercase tracking-widest text-sm mb-1">Total Proporcional</h3>
                        <div className="flex items-baseline gap-1 md:justify-end">
                            <DollarSign className="text-pink-500" size={28} />
                            <span className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {totalProportional.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseList;

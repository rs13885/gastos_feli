import React, { useState } from 'react';
import { Copy, Trash2, PieChart } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Home = ({
    expenses,
    loading,
    currentDate,
    onSave,
    onDelete,
    onCopyMonth,
    onClearMonth
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = (data) => {
        onSave(data, editingExpense);
        setShowForm(false);
        setEditingExpense(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingExpense(null);
    };

    return (
        <>
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => { setEditingExpense(null); setShowForm(!showForm); }}
                    className={`px-5 py-2 rounded-xl font-medium transition-all ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'}`}
                >
                    {showForm ? 'Cancelar' : '+ Nuevo Gasto'}
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={onCopyMonth}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
                        title="Importar gastos del mes anterior"
                    >
                        <Copy size={16} />
                        <span className="hidden md:inline">Importar de {format(subMonths(currentDate, 1), 'MMMM', { locale: es })}</span>
                        <span className="md:hidden">Importar</span>
                    </button>

                    <button
                        onClick={onClearMonth}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        title="Vaciar mes actual"
                    >
                        <Trash2 size={16} />
                        <span className="hidden md:inline">Vaciar Mes</span>
                    </button>
                </div>
            </div>

            {/* Form Area */}
            {showForm && (
                <div className="animate-fade-in-down">
                    <ExpenseForm
                        onSave={handleSave}
                        initialData={editingExpense}
                        onCancel={handleCancel}
                        currentMonthDate={currentDate}
                    />
                </div>
            )}

            {/* List Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                </div>
            ) : (
                <ExpenseList
                    expenses={expenses}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                />
            )}
        </>
    );
};

export default Home;

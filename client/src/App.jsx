import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subMonths, addMonths, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Copy, PieChart, Trash2 } from 'lucide-react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [currentDate]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await axios.get(`${API_URL}/expenses`, { params: { month, year } });
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      if (expenseData.id || editingExpense) {
        const id = expenseData.id || editingExpense.id;
        await axios.put(`${API_URL}/expenses/${id}`, expenseData);
      } else {
        await axios.post(`${API_URL}/expenses`, expenseData);
      }
      setShowForm(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error al guardar el gasto');
    }
  };

  const handleDeleteExpense = async (id) => {
    // if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleCopyMonth = async () => {
    const prevMonthDate = subMonths(currentDate, 1);
    const sourceMonthStr = format(prevMonthDate, 'MMMM', { locale: es });

    if (!confirm(`¿Copiar todos los gastos de ${sourceMonthStr} a este mes? Esto duplicará los items.`)) return;

    try {
      await axios.post(`${API_URL}/expenses/copy`, {
        sourceMonth: prevMonthDate.getMonth() + 1,
        sourceYear: prevMonthDate.getFullYear(),
        targetMonth: currentDate.getMonth() + 1,
        targetYear: currentDate.getFullYear()
      });
      fetchExpenses();
      alert('Gastos importados correctamente');
    } catch (error) {
      console.error('Error copying expenses:', error);
      alert('Error al importar gastos');
    }
  };


  const handleClearMonth = async () => {
    const monthStr = format(currentDate, 'MMMM', { locale: es });
    if (!confirm(`¿Estás seguro de vaciar TODO el mes de ${monthStr}? Esta acción no se puede deshacer.`)) return;

    try {
      await axios.delete(`${API_URL}/expenses/month`, {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        }
      });
      fetchExpenses();
      alert('Mes vaciado correctamente');
    } catch (error) {
      console.error('Error clearing month:', error);
      alert('Error al vaciar el mes');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-pink-600 p-2 rounded-lg">
              <PieChart className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-purple-700 hidden md:block">
              Gastos Compartidos
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-full transition-shadow shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-gray-700 w-32 text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-white rounded-full transition-shadow shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

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
              onClick={handleCopyMonth}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
              title="Importar gastos del mes anterior"
            >
              <Copy size={16} />
              <span className="hidden md:inline">Importar de {format(subMonths(currentDate, 1), 'MMMM', { locale: es })}</span>
              <span className="md:hidden">Importar</span>
            </button>

            <button
              onClick={handleClearMonth}
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
              onSave={handleSaveExpense}
              initialData={editingExpense}
              onCancel={() => { setShowForm(false); setEditingExpense(null); }}
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
            onDelete={handleDeleteExpense}
          />
        )}

      </main>
    </div>
  );
}

export default App;

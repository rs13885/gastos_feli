import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { format, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, PieChart, Home as HomeIcon, BarChart3, Settings } from 'lucide-react';

import Home from './pages/Home';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [currentDate]);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSaveExpense = async (expenseData, editingExpense) => {
    try {
      if (expenseData.id || editingExpense) {
        const id = expenseData.id || editingExpense?.id;
        await axios.put(`${API_URL}/expenses/${id}`, expenseData);
      } else {
        await axios.post(`${API_URL}/expenses`, expenseData);
      }
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error al guardar el gasto');
    }
  };

  const handleDeleteExpense = async (id) => {
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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 bg-opacity-80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-pink-600 p-2 rounded-lg">
                <PieChart className="text-white" size={20} />
              </div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-purple-700 hidden md:block">
                Gastos Feli
              </h1>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <NavLink
                to="/"
                className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <HomeIcon size={16} />
                <span className="hidden sm:inline">Inicio</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Reportes</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Config</span>
              </NavLink>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 hover:bg-white rounded-full transition-shadow shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-gray-700 w-24 sm:w-32 text-center capitalize text-sm sm:text-base">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </span>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 hover:bg-white rounded-full transition-shadow shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <Home
                expenses={expenses}
                loading={loading}
                currentDate={currentDate}
                categories={categories}
                onSave={handleSaveExpense}
                onDelete={handleDeleteExpense}
                onCopyMonth={handleCopyMonth}
                onClearMonth={handleClearMonth}
              />
            } />
            <Route path="/reports" element={
              <Reports expenses={expenses} />
            } />
            <Route path="/settings" element={
              <SettingsPage onCategoriesChange={fetchCategories} />
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

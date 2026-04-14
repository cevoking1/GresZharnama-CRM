import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Package, LogOut, CheckCircle2, 
  Clock, PlusCircle, Search, History, Settings, Truck, Plus, Trash2, ArrowUpRight, ArrowDownLeft, MessageSquare, Edit3
} from 'lucide-react';

const Dashboard = () => {
  // --- 1. ЗАЩИТА И БЕЗОПАСНОСТЬ ---
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Если токена нет — блокируем рендер и редиректим
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [view, setView] = useState(isAdmin ? 'overview' : 'orders');

  // Состояния форм
  const [customer, setCustomer] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [meters, setMeters] = useState('');
  const [comment, setComment] = useState(''); 
  const [stockAmount, setStockAmount] = useState('');
  const [newMatName, setNewMatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearch, setHistorySearch] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('all');

  // --- 2. ЭФФЕКТЫ ЗАЩИТЫ ---
  useEffect(() => {
    // Если не админ пытается обойти защиту — принудительно возвращаем на заказы
    if (!isAdmin && view !== 'orders') {
      setView('orders');
    }
    fetchData();
  }, [view]);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Token ${token}` } };
    try {
      const [ord, mat, stock] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/orders/', config),
        axios.get('http://127.0.0.1:8000/api/materials/', config),
        axios.get('http://127.0.0.1:8000/api/stockins/', config)
      ]);
      setOrders(ord.data);
      setMaterials(mat.data);
      setStockHistory(stock.data);
    } catch (err) { 
      if (err.response && err.response.status === 401) {
        logout(); // Если токен невалиден
      }
    }
  };

  // --- 3. ЛОГИКА ФУНКЦИЙ ---

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/orders/', 
      { customer, material: materialId, meters_needed: meters, comment, status: 'waiting' }, 
      { headers: { Authorization: `Token ${token}` } });
      setCustomer(''); setMaterialId(''); setMeters(''); setComment(''); fetchData();
    } catch (err) { alert("Ошибка при создании"); }
  };

  const handleComplete = async (id) => {
    const waste = window.prompt("Введите метры брака (0 если нет):", "0");
    if (waste === null) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/orders/${id}/`, 
      { status: 'done', waste_meters: parseFloat(waste.replace(',', '.')) || 0 }, 
      { headers: { Authorization: `Token ${token}` } });
      fetchData();
    } catch (err) { alert("Ошибка списания"); }
  };

  const handleEditMaterial = async (id, oldName) => {
    const newName = window.prompt("Новое название материала:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/materials/${id}/`, 
      { name: newName }, { headers: { Authorization: `Token ${token}` } });
      fetchData();
    } catch (err) { alert("Ошибка изменения"); }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Удалить материал? Это сотрет все данные о нем!")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/materials/${id}/`, { headers: { Authorization: `Token ${token}` } });
      fetchData();
    } catch (err) { alert("Ошибка удаления"); }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  // --- 4. ФИЛЬТРАЦИЯ ---
  const filteredOrders = orders.filter(o => 
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'all' ? true : o.status === filterStatus)
  );

  const filteredHistory = orders.filter(o => 
    o.status === 'done' && o.customer.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col p-6 shadow-sm">
        <div className="mb-10 px-2 text-center">
          <h2 className="text-2xl font-black text-blue-600 italic tracking-tighter">GRES.CRM</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            {isAdmin ? 'Администрирование' : 'Производство'}
          </p>
        </div>

        <nav className="space-y-2 flex-1">
          {isAdmin && (
            <MenuBtn active={view === 'overview'} icon={<LayoutDashboard size={20}/>} label="Остатки" onClick={() => setView('overview')} />
          )}
          <MenuBtn active={view === 'orders'} icon={<Clock size={20}/>} label="Заказы" onClick={() => setView('orders')} />
          {isAdmin && (
            <>
              <MenuBtn active={view === 'inventory'} icon={<Settings size={20}/>} label="База материалов" onClick={() => setView('inventory')} />
              <MenuBtn active={view === 'history'} icon={<History size={20}/>} label="Архив / Логи" onClick={() => setView('history')} />
            </>
          )}
        </nav>

        <button onClick={logout} className="mt-auto flex items-center space-x-3 p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all font-bold">
          <LogOut size={20} /> <span>Выйти</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* VIEW: OVERVIEW */}
        {view === 'overview' && isAdmin && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black uppercase italic">Складской учет</h1>
              <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                Заказов в очереди: {orders.filter(o => o.status === 'waiting').length}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map(m => (
                <div key={m.id} className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 relative overflow-hidden">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{m.name}</p>
                  <h3 className={`text-4xl font-black ${m.stock_meters < 15 ? 'text-red-500' : 'text-gray-800'}`}>
                    {m.stock_meters} <span className="text-sm font-normal text-gray-400">м.</span>
                  </h3>
                  <div className="mt-6 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${Math.min(m.stock_meters, 100)}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ORDERS */}
        {view === 'orders' && (
          <div className="animate-fadeIn space-y-8">
            {isAdmin && (
              <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black mb-6 flex items-center italic tracking-tight uppercase"><PlusCircle size={20} className="mr-2 text-blue-600"/> Принять заказ</h3>
                <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <input type="text" placeholder="Заказчик" className="bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={customer} onChange={e => setCustomer(e.target.value)} required />
                  <select className="bg-gray-50 p-4 rounded-2xl outline-none font-bold cursor-pointer" value={materialId} onChange={e => setMaterialId(e.target.value)} required>
                    <option value="">Материал...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="number" step="0.01" placeholder="Длина" className="bg-gray-50 p-4 rounded-2xl outline-none" value={meters} onChange={e => setMeters(e.target.value)} required />
                  <input type="text" placeholder="Заметка" className="bg-gray-50 p-4 rounded-2xl outline-none" value={comment} onChange={e => setComment(e.target.value)} />
                  <button type="submit" className="bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all text-xs uppercase py-4">Создать</button>
                </form>
              </section>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
               <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                  {['all', 'waiting', 'done'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${filterStatus === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      {s === 'all' ? 'Все' : s === 'waiting' ? 'В работе' : 'Готово'}
                    </button>
                  ))}
               </div>
               <div className="relative w-full lg:w-72">
                  <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
                  <input type="text" placeholder="Найти клиента..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm outline-none" />
               </div>
            </div>

            <div className="bg-white rounded-[35px] shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100">
                    <tr>
                      <th className="px-10 py-6">Заказчик</th>
                      <th className="px-10 py-6">Материал</th>
                      <th className="px-10 py-6">Длина</th>
                      <th className="px-10 py-6">Заметка</th>
                      <th className="px-10 py-6 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/30">
                        <td className="px-10 py-6 font-bold uppercase tracking-tight">{o.customer}</td>
                        <td className="px-10 py-6 text-gray-400">{o.material_name}</td>
                        <td className="px-10 py-6 font-black text-blue-600">{o.meters_needed} м.</td>
                        <td className="px-10 py-6 italic text-gray-400">{o.comment || '—'}</td>
                        <td className="px-10 py-6 text-right">
                          {o.status === 'done' ? (
                            <span className="text-[9px] font-black px-3 py-1 bg-green-100 text-green-600 rounded-lg">ГОТОВО</span>
                          ) : (
                            <button 
                              onClick={() => handleComplete(o.id)} 
                              className={`${!isAdmin ? 'bg-blue-600 px-10 py-4 scale-110 shadow-lg shadow-blue-100' : 'bg-gray-900 px-5 py-2.5'} text-white text-[10px] font-black rounded-xl hover:bg-green-600 transition-all active:scale-95`}
                            >
                              ОТМЕТИТЬ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* VIEW: INVENTORY */}
        {isAdmin && view === 'inventory' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
              <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter">Типы материалов</h3>
                <form onSubmit={handleAddMaterial} className="space-y-4 mb-8">
                  <input type="text" placeholder="Название..." className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold" value={newMatName} onChange={e => setNewMatName(e.target.value)} required />
                  <button type="submit" className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl uppercase text-xs">Добавить</button>
                </form>
                <div className="space-y-3">
                   {materials.map(m => (
                     <div key={m.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl">
                       <span className="font-bold text-sm uppercase">{m.name}</span>
                       <div className="flex space-x-2">
                         <button onClick={() => handleEditMaterial(m.id, m.name)} className="text-blue-400 hover:text-blue-600 p-1"><Edit3 size={18}/></button>
                         <button onClick={() => handleDeleteMaterial(m.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                       </div>
                     </div>
                   ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter text-green-600">Закупка рулонов</h3>
                <form onSubmit={handleStockIn} className="space-y-6">
                  <select className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold cursor-pointer" value={materialId} onChange={e => setMaterialId(e.target.value)} required>
                    <option value="">Что пришло?</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="number" step="0.01" placeholder="Длина рулона" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-xl" value={stockAmount} onChange={e => setStockAmount(e.target.value)} required />
                  <button type="submit" className="w-full bg-green-600 text-white font-black py-5 rounded-2xl uppercase text-xs shadow-lg shadow-green-100">Внести приход</button>
                </form>
              </section>
           </div>
        )}

        {/* VIEW: HISTORY */}
        {isAdmin && view === 'history' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="relative w-full lg:w-96 mb-4">
                <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input type="text" placeholder="Поиск по архиву..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl shadow-sm outline-none" />
             </div>
             <div className="bg-white rounded-[35px] shadow-sm overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-50 flex items-center text-blue-600 italic">
                  <ArrowUpRight size={24} className="mr-3" /> <h3 className="text-xl font-black uppercase">Журнал производства</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr><th className="px-10 py-5">Дата</th><th className="px-10 py-5">Клиент</th><th className="px-10 py-5 text-right">Итог (Расход + Брак)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredHistory.map(o => (
                      <tr key={o.id}>
                        <td className="px-10 py-5 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="px-10 py-5 font-bold uppercase">{o.customer}</td>
                        <td className="px-10 py-5 text-right font-black text-blue-600">{(parseFloat(o.meters_needed) + parseFloat(o.waste_meters)).toFixed(2)} м.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const MenuBtn = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 p-5 rounded-3xl transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
      active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 translate-x-3' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-800'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

export default Dashboard;
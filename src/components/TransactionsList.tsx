'use client';
import { useState, useMemo } from 'react';
import { Text } from "@tremor/react";

// FUNCIÓN DE FECHA BLINDADA: Funciona con guiones (-), barras (/) o formato ISO
const parseDateSafe = (dateString: string) => {
  if (!dateString) return { year: 0, month: 0, day: 0 };
  
  try {
    // Intentamos convertir a string y limpiar espacios
    const str = dateString.toString().trim();
    
    // Si viene en formato ISO (2024-05-23T...) nos quedamos con la primera parte
    const cleanDate = str.includes('T') ? str.split('T')[0] : str;
    
    // Detectamos si usa guiones o barras
    const separator = cleanDate.includes('/') ? '/' : '-';
    const parts = cleanDate.split(separator);

    if (parts.length >= 3) {
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]) - 1, // Meses en JS son 0-11
        day: parseInt(parts[2])
      };
    }
    
    // Fallback: Si todo falla, intentamos usar el objeto Date nativo
    const fallbackDate = new Date(dateString);
    if (!isNaN(fallbackDate.getTime())) {
      return {
        year: fallbackDate.getFullYear(),
        month: fallbackDate.getMonth(),
        day: fallbackDate.getDate()
      };
    }
    
    return { year: 0, month: 0, day: 0 };
  } catch (e) {
    return { year: 0, month: 0, day: 0 };
  }
};

export default function TransactionsList({ data }: { data: any[] }) {
  const now = new Date();

  // 1. DETECTOR DE AÑOS DISPONIBLES (Mejorado para detectar años de ingresos también)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(now.getFullYear()); // Siempre incluir año actual
    
    data.forEach(t => {
      const { year } = parseDateSafe(t.date);
      if (year > 2000) years.add(year); // Filtramos años inválidos
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  // ESTADOS
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
  const [sortType, setSortType] = useState<'date' | 'high' | 'low'>('date');

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // 2. FILTRADO (Ahora busca en todo)
  const filteredData = data.filter((t) => {
    const { year, month } = parseDateSafe(t.date);
    return month === selectedMonth && year === selectedYear;
  });

  // 3. ORDENAMIENTO
  const sortedData = [...filteredData].sort((a, b) => {
    const amountA = Number(a.amount);
    const amountB = Number(b.amount);

    if (sortType === 'high') return amountB - amountA;
    if (sortType === 'low') return amountA - amountB;
    // Por fecha
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="glass-panel p-6 h-[450px] flex flex-col w-full">
      {/* CABECERA (Diseño intacto) */}
      <div className="flex flex-col gap-4 mb-6 border-b border-white/5 pb-4">
        <div className="flex justify-between items-center">
             <h3 className="text-gray-200 text-lg font-semibold">Últimos Movimientos</h3>
             <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-md">
                {sortedData.length}
             </span>
        </div>
        
        {/* FILTROS */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Selector de Mes */}
          <div className="relative group">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-black/40 border border-white/10 hover:border-premium-green/50 text-gray-300 text-xs rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer transition-all w-full md:w-auto"
            >
              {months.map((m, i) => (
                <option key={i} value={i} className="bg-gray-900">{m}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Selector de Año */}
          <div className="relative">
             <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-black/40 border border-white/10 hover:border-premium-green/50 text-premium-green font-medium text-xs rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer transition-all"
            >
              {availableYears.map((year) => (
                <option key={year} value={year} className="bg-gray-900">{year}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-premium-green">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <div className="hidden md:block flex-1"></div>

          {/* Selector de Orden */}
          <div className="relative w-full md:w-auto">
             <select 
              value={sortType}
              onChange={(e) => setSortType(e.target.value as any)}
              className="appearance-none w-full md:w-auto bg-black/40 border border-white/10 hover:border-gray-500 text-gray-400 text-xs rounded-lg pl-3 pr-8 py-2 outline-none cursor-pointer transition-all"
            >
              <option value="date" className="bg-gray-900">Más Recientes</option>
              <option value="high" className="bg-gray-900">Mayor Precio</option>
              <option value="low" className="bg-gray-900">Menor Precio</option>
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE DATOS */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {sortedData.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-gray-500 gap-3 opacity-60">
            <span className="text-3xl">📅</span>
            <div className="text-center">
                <p className="text-sm font-medium">Sin movimientos</p>
                <p className="text-xs">No hay registros en {months[selectedMonth]} {selectedYear}</p>
            </div>
          </div>
        ) : (
          sortedData.map((t) => {
            // Normalizamos el tipo para que funcione aunque venga en Mayúsculas (Gasto, GASTO, Ingreso, etc)
            const tipoNormalizado = t.type ? t.type.toLowerCase() : 'gasto';
            const esGasto = tipoNormalizado === 'gasto';
            const dateObj = parseDateSafe(t.date);

            return (
              <div key={t.id} className="flex justify-between items-center hover:bg-white/5 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border border-white/5 transition-transform group-hover:scale-105 shadow-lg ${esGasto ? 'bg-gradient-to-br from-red-900/40 to-red-600/10 text-premium-red' : 'bg-gradient-to-br from-green-900/40 to-green-600/10 text-premium-green'}`}>
                    <span className="text-xs font-bold">{esGasto ? '↓' : '↑'}</span>
                  </div>
                  <div>
                    <Text className="text-gray-200 font-semibold text-sm">{t.description || "Sin descripción"}</Text>
                    <Text className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 font-medium">
                      {dateObj.day} de {months[dateObj.month]} • {t.category || "General"}
                    </Text>
                  </div>
                </div>
                <div className="text-right">
                    <Text className={`font-mono text-sm font-bold tracking-tight ${esGasto ? 'text-white' : 'text-premium-green'}`}>
                      {esGasto ? '-' : '+'}${Number(t.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Text>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
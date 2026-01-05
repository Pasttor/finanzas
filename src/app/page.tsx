import { supabaseAdmin } from "@/lib/supabaseClient";
import { Metric, Text, Title, Flex, Grid } from "@tremor/react";
import AutoRefresh from "@/components/AutoRefresh";
import TransactionsList from "@/components/TransactionsList"; 

// FORZAR DATOS FRESCOS
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (!transactions) return { totalGastos: 0, totalIngresos: 0, saldoTotal: 0, lista: [], dataGrafica: [] };

  const totalGastos = transactions
    .filter((t) => t.type === 'gasto')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIngresos = transactions
    .filter((t) => t.type === 'ingreso') // Ojo: asegura que en tu BD sea 'ingreso' (minúscula)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const saldoTotal = totalIngresos - totalGastos;

  const gastosPorCategoria = transactions
    .filter((t) => t.type === 'gasto')
    .reduce((acc: any, curr) => {
      const cat = curr.category || 'Otros';
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {});

  const dataGrafica = Object.entries(gastosPorCategoria)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  return { 
    totalGastos, 
    totalIngresos, 
    saldoTotal, 
    // CORRECCIÓN AQUÍ: Quitamos .slice(0, 5) para que pase TODO el historial
    lista: transactions, 
    dataGrafica 
  };
}

export default async function Home() {
  const { totalGastos, totalIngresos, saldoTotal, lista, dataGrafica } = await getData();
  const maxValue = Math.max(...dataGrafica.map(d => d.value), 1); 

  const esSaldoPositivo = saldoTotal >= 0;
  const colorSaldo = esSaldoPositivo ? 'text-premium-green' : 'text-premium-red';
  const sombraSaldo = esSaldoPositivo ? 'shadow-[0_0_30px_rgba(189,255,0,0.3)]' : 'shadow-[0_0_30px_rgba(255,46,46,0.3)]';

  return (
    <main className="p-8 md:p-12 max-w-6xl mx-auto">
      <AutoRefresh />

      <div className="mb-8 flex justify-between items-end">
        <div>
          <Text className="text-gray-500 font-medium tracking-wide text-sm mb-1">DASHBOARD</Text>
          <Title className="text-3xl md:text-4xl font-semibold text-gray-100">
            Resumen Financiero 💰
          </Title>
        </div>
      </div>

      {/* SECCIÓN 1: SALDO ACTUAL */}
      <div className="mb-8">
        <div className="glass-panel p-8 relative overflow-hidden flex flex-col items-center justify-center text-center py-10">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] rounded-full pointer-events-none opacity-20 ${esSaldoPositivo ? 'bg-premium-green' : 'bg-premium-red'}`}></div>
            
            <Text className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-xs">Saldo Disponible</Text>
            
            <Metric className={`text-6xl md:text-7xl font-bold tracking-tighter ${colorSaldo} drop-shadow-2xl`}>
              $ {saldoTotal.toLocaleString('es-MX')}
            </Metric>

            <div className={`mt-4 px-4 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md ${sombraSaldo}`}>
                <Text className="text-gray-300 text-sm">
                    {esSaldoPositivo ? 'Finanzas Saludables 🚀' : 'Atención Requerida ⚠️'}
                </Text>
            </div>
        </div>
      </div>

      {/* SECCIÓN 2: Desglose */}
      <Grid numItems={1} numItemsSm={2} className="gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:bg-white/5 transition-colors">
          <Flex justifyContent="between" alignItems="center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-premium-red/10 flex items-center justify-center text-premium-red">↓</div>
                <div>
                    <Text className="text-gray-400 font-medium text-xs uppercase">Gastos</Text>
                    <Metric className="text-3xl text-white font-bold">$ {totalGastos.toLocaleString('es-MX')}</Metric>
                </div>
            </div>
          </Flex>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between h-32 relative overflow-hidden group hover:bg-white/5 transition-colors">
          <Flex justifyContent="between" alignItems="center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-premium-green/10 flex items-center justify-center text-premium-green">↑</div>
                <div>
                    <Text className="text-gray-400 font-medium text-xs uppercase">Ingresos</Text>
                    <Metric className="text-3xl text-white font-bold">$ {totalIngresos.toLocaleString('es-MX')}</Metric>
                </div>
            </div>
          </Flex>
        </div>
      </Grid>

      {/* SECCIÓN 3: Gráficos y Listas */}
      <Grid numItems={1} numItemsSm={2} className="gap-6">
        
        {/* GRÁFICO */}
        <div className="glass-panel p-8 flex flex-col h-[450px]">
          <Flex justifyContent="between" alignItems="center" className="mb-6">
             <Title className="text-gray-200 text-lg font-medium">Gastos por Categoría</Title>
             <div className="px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50">
                <Text className="text-[10px] text-gray-400 font-medium uppercase">Mensual</Text>
             </div>
          </Flex>
          
          <div className="flex-1 flex items-end justify-center gap-4 w-full mt-4 pb-2">
            {dataGrafica.length > 0 ? (
                dataGrafica.map((item) => {
                  const isMax = item.value === maxValue;
                  const heightPercentage = Math.max((item.value / maxValue) * 100, 15); 
                  
                  return (
                    <div key={item.name} className="flex flex-col items-center gap-2 h-full justify-end w-full max-w-[60px] group cursor-pointer">
                      <div 
                        style={{ height: `${heightPercentage}%` }} 
                        className={`
                          w-full rounded-t-lg transition-all duration-700 relative
                          ${isMax 
                            ? 'bg-gradient-to-t from-premium-green/10 via-premium-green to-premium-green shadow-[0_0_20px_rgba(189,255,0,0.2)]' 
                            : 'bg-gradient-to-t from-gray-800/20 to-gray-700 hover:to-gray-600'}
                        `}
                      >
                          {isMax && (
                             <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                                ${item.value}
                             </div>
                          )}
                      </div>
                      <Text className={`text-[9px] uppercase tracking-wider text-center font-bold truncate w-full ${isMax ? 'text-white' : 'text-gray-600'}`}>
                        {item.name}
                      </Text>
                    </div>
                  );
                })
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Text>Sin datos</Text>
                </div>
            )}
          </div>
        </div>

        {/* LISTA DE MOVIMIENTOS */}
        <TransactionsList data={lista} />

      </Grid>
    </main>
  );
}
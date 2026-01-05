'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Card, Grid, Select, Text, Title, Group, Paper, RingProgress, ThemeIcon, Stack, Skeleton, Tooltip, Center 
} from '@mantine/core'; 
import { 
  IconChartBar, IconUsers, IconCoin, IconCalendarStats, IconArrowUpRight, IconTrendingUp, IconInfoCircle 
} from '@tabler/icons-react';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProjectsStore } from '@/src/presentation/stores/projects.store';
import { useCashControlStore } from '@/src/presentation/stores/cash-control.store';

import { formatCurrency } from '@/src/presentation/utils/format-currency';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

const STATUS_LABELS: Record<string, string> = {
  BUDGET: 'Presupuesto',
  ACTIVE: 'Activo',
  IN_PROCESS: 'En Proceso',
  FINISHED: 'Finalizado',
  DELETED: 'Eliminado'
};

export function ProjectStatistics() {
  const { 
    projects, 
    fetchProjects, 
    isLoading: loadingProjects 
  } = useProjectsStore();

  const { 
    expensesList, 
    fetchExpenses, 
    isLoading: loadingExpenses 
  } = useCashControlStore();

  const [chartMode, setChartMode] = useState<string>('financial');
  
  const isLoading = loadingProjects || loadingExpenses;

  useEffect(() => {
    // Pedimos 100 proyectos para la estadística
    fetchProjects({ limit: 100 } as any); 
    
    // Pedimos los gastos (fetchExpenses ya guarda en expensesList)
    fetchExpenses(); 
  }, [fetchProjects, fetchExpenses]);

  const stats = useMemo(() => {
    // Validamos contra los datos del store
    if (!projects.length) return null;

    // PROCESAMIENTO FINANCIERO 
    const financialData = projects.map(p => {
      const externalCollaboratorCost = p.collaborators?.reduce((acc: number, curr: any) => acc + (curr.totalCost || 0), 0) || 0;
      const margin = p.amount - externalCollaboratorCost;
      
      return {
        name: p.client?.fullname || 'N/A',
        shortName: p.client?.fullname?.split(' ')[0] || 'Cliente',
        presupuesto: p.amount,
        gasto: externalCollaboratorCost,
        margen: margin > 0 ? margin : 0,
      };
    })
    .sort((a, b) => b.presupuesto - a.presupuesto)
    .slice(0, 10);

    // TIEMPOS 
    const durationData = projects
      .filter(p => p.dateInit && p.dateEnd)
      .map(p => {
        const start = parseISO(p.dateInit);
        const end = parseISO(p.dateEnd);
        const days = isValid(start) && isValid(end) ? differenceInDays(end, start) : 0;
        return {
          name: p.client?.fullname?.substring(0, 15) || 'Cliente', 
          fullName: p.client?.fullname || 'Cliente',
          dias: Math.max(0, days),
          inicio: isValid(start) ? format(start, 'dd/MM/yy', { locale: es }) : '-',
          fin: isValid(end) ? format(end, 'dd/MM/yy', { locale: es }) : '-'
        };
      })
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 12);

    // ESTADOS
    const statusCount = projects.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusData = Object.keys(statusCount).map(key => ({ 
      name: STATUS_LABELS[key] || key, 
      value: statusCount[key] 
    }));

    // TARJETAS GLOBALES 
    const totalRevenue = projects.reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExternalCost = projects.reduce((acc, curr) => 
      acc + (curr.collaborators?.reduce((c: number, col: any) => c + (col.totalCost || 0), 0) || 0), 0);

    // Usar expensesList directo del store
    const totalStaffExpenses = expensesList
      .filter(e => e.category?.name?.toLowerCase().includes('pago de horas')) 
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalOperationalCost = totalExternalCost + totalStaffExpenses;
    const marginPercent = totalRevenue > 0 ? ((totalRevenue - totalOperationalCost) / totalRevenue) * 100 : 0;
    const avgDays = durationData.length ? Math.round(durationData.reduce((a, b) => a + b.dias, 0) / durationData.length) : 0;

    return { 
      financialData, 
      durationData, 
      statusData, 
      totalRevenue, 
      totalOperationalCost, 
      totalExternalCost,    
      totalStaffExpenses,   
      marginPercent, 
      avgDays 
    };
  }, [projects, expensesList]); // Dependencias ahora son los datos del store

  if (isLoading && !projects.length) return <Skeleton height={400} radius="md" />;
  if (!stats) return <Text>Sin datos disponibles</Text>;

  return (
    <Stack gap="xl">
      
      {/* TARJETAS */}
      <Grid gutter="md">
        <KpiCard 
          title="Ingresos Estimados" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={<IconCoin size={24} />} 
          color="blue"
          subtext="Suma total presupuestada"
        />
        <KpiCard 
          title="Costo Operativo" 
          value={formatCurrency(stats.totalOperationalCost)} 
          icon={<IconUsers size={24} />} 
          color="red"
          tooltip={`Externos: ${formatCurrency(stats.totalExternalCost)} | Internos: ${formatCurrency(stats.totalStaffExpenses)}`}
          subtext="Colaboradores + Pago de Horas"
        />
        <KpiCard 
          title="Margen Global" 
          value={`${stats.marginPercent.toFixed(1)}%`} 
          icon={<IconTrendingUp size={24} />} 
          color="teal"
          subtext="Rentabilidad real estimada"
          progress={stats.marginPercent}
        />
        <KpiCard 
          title="Tiempo Promedio" 
          value={`${stats.avgDays} días`} 
          icon={<IconCalendarStats size={24} />} 
          color="orange"
          subtext="Duración media"
        />
      </Grid>

      {/* GRÁFICO PRINCIPAL */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Group gap="xs">
            <ThemeIcon variant="light" size="lg" color="gray">
              <IconChartBar size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="md">Análisis Detallado</Text>
              <Text size="xs" c="dimmed">Visualización dinámica de estados de proyectos</Text>
            </div>
          </Group>
          
          <Select
            value={chartMode}
            onChange={(v) => setChartMode(v || 'financial')}
            size="sm"
            w={220}
            data={[
              { value: 'financial', label: 'Financiero (Ingresos vs Costos)' },
              { value: 'time', label: 'Tiempos (Duración en días)' },
              { value: 'status', label: 'Distribución de Estados' },
            ]}
            allowDeselect={false}
          />
        </Group>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'financial' ? (
              <BarChart data={stats.financialData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  axisLine={false} 
                  tickLine={false}
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(val) => `$${val / 1000}k`} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Paper shadow="md" p="sm" radius="md" withBorder>
                          <Text size="sm" fw={700} mb={4}>{payload[0].payload.name}</Text>
                          <Group gap="xs" mb={2}>
                             <div className="w-2 h-2 rounded-full bg-blue-500" />
                             <Text size="xs" c="dimmed">Presupuesto: <span className="font-semibold text-gray-700">{formatCurrency(payload[0].value as number)}</span></Text>
                          </Group>
                          <Group gap="xs">
                             <div className="w-2 h-2 rounded-full bg-red-400" />
                             <Text size="xs" c="dimmed">Costo Directo: <span className="font-semibold text-gray-700">{formatCurrency(payload[1].value as number)}</span></Text>
                          </Group>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="presupuesto" name="Ingreso" fill={COLORS[0]} radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="gasto" name="Costo Directo" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            ) : chartMode === 'time' ? (
              <BarChart data={stats.durationData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Paper shadow="md" p="sm" radius="md" withBorder>
                          <Text size="sm" fw={700} mb={2}>{data.fullName}</Text>
                          <Text size="xs" c="dimmed" mb={1}>Inicio: {data.inicio}</Text>
                          <Text size="xs" c="dimmed" mb={4}>Fin: {data.fin}</Text>
                          <Group gap="xs">
                             <IconCalendarStats size={14} className="text-emerald-500" />
                             <Text size="sm" fw={600} c="teal">Duración: {data.dias} días</Text>
                          </Group>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="dias" 
                  name="Días de Ejecución" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  label={{ position: 'right', fill: '#6b7280', fontSize: 10 }} 
                />
              </BarChart>
            ) : (
              <PieChart>
                 <Pie
                    data={stats.statusData}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
    </Stack>
  );
}

function KpiCard({ title, value, icon, color, subtext, progress, tooltip }: any) {
  return (
    <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
      <Tooltip label={tooltip} disabled={!tooltip} multiline w={220} withArrow transitionProps={{ duration: 200 }}>
        <Paper shadow="sm" p="md" radius="md" withBorder className="h-full flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
          <Group justify="space-between" mb="xs">
            <ThemeIcon color={color} variant="light" size="lg" radius="md">
              {icon}
            </ThemeIcon>
            {progress !== undefined ? (
              <RingProgress 
                size={40} thickness={4} roundCaps 
                sections={[{ value: progress, color: color }]} 
                // 🟢 CAMBIO: Usamos Center para centrar el ícono
                label={
                  <Center>
                    <IconArrowUpRight size={14} className="text-gray-400" />
                  </Center>
                }
              />
            ) : tooltip && (
               <IconInfoCircle size={16} className="text-gray-400" />
            )}
          </Group>
          
          <div>
            <Text c="dimmed" tt="uppercase" fw={700} fz="xs" mb={4}>
              {title}
            </Text>
            <Title order={3} className="text-gray-800 dark:text-gray-100">
              {value}
            </Title>
            <Text c="dimmed" fz="xs" mt={4}>
              {subtext}
            </Text>
          </div>
        </Paper>
      </Tooltip>
    </Grid.Col>
  );
}
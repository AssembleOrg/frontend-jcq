"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Container, Grid, Paper, Text, Group, Button, 
  Tabs, Modal, Table, Badge, ActionIcon, Alert,
  TextInput, Select, Pagination 
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconPlus, IconWallet, IconArrowUpRight, IconArrowDownLeft, 
  IconTrash, IconSettings, IconPencil, IconSearch, IconFilter,
  IconCalendar 
} from '@tabler/icons-react';
import { useCashControlStore } from '@/src/presentation/stores/cash-control.store';
import { formatCurrency } from '@/src/presentation/utils/format-currency';
import { ExpenseForm } from '@/src/presentation/components/cashControl/expense-form';
import { CategoriesManager } from '@/src/presentation/components/cashControl/categories-manager';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns'; 
import { es } from 'date-fns/locale';
import type { Expense } from '@/src/core/entities';

const formatExpenseDate = (dateString: string | Date | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  
  return format(correctedDate, 'dd MMM yyyy', { locale: es });
};

const ITEMS_PER_PAGE = 5;

export default function CashControlPage() {
  const { 
    expensesList, 
    incomesList, 
    categoriesList,
    totalIncome, 
    totalExpenses,
    fetchBalanceData,
    fetchCategories,
    deleteExpense,
    setSelectedExpense, 
    selectedExpense,    
  } = useCashControlStore();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // --- ESTADOS GASTOS ---
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [activePage, setActivePage] = useState(1);
  
  // --- ESTADOS INGRESOS ---
  const [activePageIncomes, setActivePageIncomes] = useState(1);
  const [searchIncomes, setSearchIncomes] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBalanceData(); 
  }, []);

    //LOGICA DE GASTOS --
  const filteredExpenses = useMemo(() => {
    return expensesList.filter(expense => {
      const matchSearch = expense.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter ? expense.categoryId === categoryFilter : true;
      
      let matchDate = true;
      const [start, end] = dateRange;
      
      if (start && end) {
        const expenseDate = new Date(expense.date);
        matchDate = isWithinInterval(expenseDate, {
            start: startOfDay(start),
            end: endOfDay(end)
        });
      } else if (start) {
         const expenseDate = new Date(expense.date);
         matchDate = expenseDate >= startOfDay(start);
      }

      return matchSearch && matchCategory && matchDate;
    });
  }, [expensesList, search, categoryFilter, dateRange]);

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  
  const paginatedExpenses = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredExpenses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExpenses, activePage]);

  // Resetear página de gastos si cambian filtros
  useEffect(() => { setActivePage(1); }, [search, categoryFilter, dateRange]);


 // LOGICA INGRESOS ---
  const filteredIncomes = useMemo(() => {
    return incomesList.filter(income => {
      if (!searchIncomes) return true;
      const term = searchIncomes.toLowerCase();
      
      // Buscar en varias propiedades del ingreso
      const project = income.project?.event?.toLowerCase() || '';
      const bill = income.bill?.toLowerCase() || '';
      const number = String(income.number || '');

      return project.includes(term) || bill.includes(term) || number.includes(term);
    });
  }, [incomesList, searchIncomes]);

  const totalPagesIncomes = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
  
  const paginatedIncomes = useMemo(() => {
    const start = (activePageIncomes - 1) * ITEMS_PER_PAGE;
    return filteredIncomes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIncomes, activePageIncomes]);

  // Resetear página de ingresos si cambia la búsqueda
  useEffect(() => { setActivePageIncomes(1); }, [searchIncomes]);

  const balance = totalIncome - totalExpenses;
  const getCategoryName = (id: string) => {
    return categoriesList.find(c => c.id === id)?.name || 'Sin Categoría';
  };

  const handleCreate = () => {
    setSelectedExpense(null);
    setExpenseModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleCloseForm = () => {
    setExpenseModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <Container fluid p="lg">
      
      {/* HEADER */}
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="xl" fw={900} c="white">Caja y Gastos</Text>
          <Text c="dimmed" size="sm">Control de flujo de caja del sistema</Text>
        </div>
        <Group>
          <Button variant="default" leftSection={<IconSettings size={18} />} onClick={() => setCategoriesModalOpen(true)}>
            Categorías
          </Button>
          <Button color="red" leftSection={<IconPlus size={18} />} onClick={handleCreate}>
            Nuevo Gasto
          </Button>
        </Group>
      </Group>

      {/* DASHBOARD (Totales) */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" radius="md" withBorder style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Ingresos Totales</Text>
              <IconArrowUpRight size={24} color="#22c55e" />
            </Group>
            <Text size="2rem" fw={700} c="white">{formatCurrency(totalIncome)}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" radius="md" withBorder style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Egresos Totales</Text>
              <IconArrowDownLeft size={24} color="#ef4444" />
            </Group>
            <Text size="2rem" fw={700} c="white">{formatCurrency(totalExpenses)}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" radius="md" withBorder bg={balance >= 0 ? undefined : 'rgba(239,68,68,0.1)'}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Balance Neto</Text>
              <IconWallet size={24} color={balance >= 0 ? "#3b82f6" : "#ef4444"} />
            </Group>
            <Text size="2rem" fw={700} c={balance >= 0 ? "blue" : "red"}>{formatCurrency(balance)}</Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* TABS PRINCIPALES */}
      <Paper withBorder radius="md" p="md">
        <Tabs defaultValue="expenses" variant="pills" color="orange">
          <Tabs.List mb="md">
            <Tabs.Tab value="expenses">Gastos Registrados</Tabs.Tab>
            <Tabs.Tab value="incomes">Ingresos (Pagos)</Tabs.Tab>
          </Tabs.List>

          {/*  PANEL DE GASTOS  */}
          <Tabs.Panel value="expenses">
            
            <Group mb="md" grow align="flex-start">
              <TextInput 
                placeholder="Buscar descripción..." 
                leftSection={<IconSearch size={16}/>}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
              <Select 
                placeholder="Categoría"
                leftSection={<IconFilter size={16}/>}
                data={categoriesList.map(c => ({ value: c.id, label: c.name }))}
                clearable
                searchable
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
              <DatePickerInput
                type="range"
                placeholder="Filtrar por fechas"
                leftSection={<IconCalendar size={16}/>}
                value={dateRange}
                onChange={(value) => setDateRange(value as [Date | null, Date | null])}
                clearable
                locale="es"
                valueFormat="DD/MM/YYYY"
              />
            </Group>

            {paginatedExpenses.length === 0 ? (
                <Alert color="gray" variant="light" mt="md">
                  {expensesList.length === 0 
                    ? "No hay gastos registrados." 
                    : "No se encontraron gastos con estos filtros."}
                </Alert>
            ) : (
                <>
                <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Descripción</Table.Th>
                    <Table.Th>Categoría</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Monto</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {paginatedExpenses.map((expense) => (
                    <Table.Tr key={expense.id}>
                        <Table.Td>
                            {/* Usar el helper para corregir la visualización */}
                            {formatExpenseDate(expense.date)}
                        </Table.Td>
                        <Table.Td><Text size="sm" fw={500}>{expense.description}</Text></Table.Td>
                        <Table.Td>
                            <Badge variant="dot" color="gray" size="sm">
                                {getCategoryName(expense.categoryId)}
                            </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }} fw={700} c="red">
                            - {formatCurrency(expense.amount)}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                            <Group gap={4} justify="center">
                                <ActionIcon color="blue" variant="subtle" onClick={() => handleEdit(expense)}>
                                    <IconPencil size={18} />
                                </ActionIcon>
                                <ActionIcon color="red" variant="subtle" onClick={() => {
                                    if(confirm('¿Eliminar este gasto?')) deleteExpense(expense.id);
                                }}>
                                    <IconTrash size={18} />
                                </ActionIcon>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                    ))}
                </Table.Tbody>
                </Table>
                
                {/* Paginación Gastos */}
                {totalPages > 1 && (
                    <Group justify="center" mt="lg">
                        <Pagination total={totalPages} value={activePage} onChange={setActivePage} color="orange" />
                    </Group>
                )}
                </>
            )}
          </Tabs.Panel>
          
          {/* PANEL DE INGRESOS */}
          <Tabs.Panel value="incomes">
             
            <Group mb="md">
              <TextInput 
                placeholder="Buscar por proyecto, factura o N° pago..." 
                leftSection={<IconSearch size={16}/>}
                value={searchIncomes}
                onChange={(e) => setSearchIncomes(e.currentTarget.value)}
                style={{ flex: 1 }} 
              />
            </Group>

             {paginatedIncomes.length === 0 ? (
                <Alert color="gray" variant="light" mt="md">
                  {incomesList.length === 0 
                    ? "No se han registrado pagos de proyectos aún." 
                    : "No se encontraron resultados para tu búsqueda."}
                </Alert>
            ) : (
                 <>
                 <Table striped highlightOnHover verticalSpacing="sm">
                 <Table.Thead>
                     <Table.Tr>
                     <Table.Th>Fecha</Table.Th>
                     <Table.Th>Evento / Proyecto</Table.Th>
                     <Table.Th style={{ textAlign: 'right' }}>Monto</Table.Th>
                     </Table.Tr>
                 </Table.Thead>
                 <Table.Tbody>
                     {paginatedIncomes.map((income) => {
                        const projectEvent = income.project?.event || 'Proyecto General';
                        return (
                          <Table.Tr key={income.id}>
                              <Table.Td>
                                  {/* Se usa el mismo helper para fechas de ingresos */}
                                  {formatExpenseDate(income.date)}
                              </Table.Td>
                              <Table.Td>
                                  <Text size="sm" fw={500}>{projectEvent}</Text>
                                  <Text size="xs" c="dimmed">
                                    Pago #{income.number || '?'} {income.bill ? `• Factura: ${income.bill}` : ''}
                                  </Text>
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'right' }} fw={700} c="green">
                                  + {formatCurrency(income.amount)}
                              </Table.Td>
                          </Table.Tr>
                        );
                     })}
                 </Table.Tbody>
                 </Table>
                 
                 {/* Paginación Ingresos */}
                 {totalPagesIncomes > 1 && (
                    <Group justify="center" mt="lg">
                        <Pagination 
                          total={totalPagesIncomes} 
                          value={activePageIncomes} 
                          onChange={setActivePageIncomes} 
                          color="teal" 
                        />
                    </Group>
                 )}
                 </>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <ExpenseForm isOpen={expenseModalOpen} onClose={handleCloseForm} expense={selectedExpense} />
      
      <Modal opened={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} title="Gestionar Categorías">
        <CategoriesManager />
      </Modal>

    </Container>
  );
}
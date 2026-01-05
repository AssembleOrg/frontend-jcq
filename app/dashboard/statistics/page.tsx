'use client';

import { Box } from '@mantine/core';
import { Header } from '@/src/presentation/components/layout/header';
import { ProjectStatistics } from '@/src/presentation/components/statistics/project-statistics';

export default function StatisticsPage() {
  return (
    <Box>
      <Header
        title="Análisis y Estadísticas"
        description="Resumen ejecutivo de rendimiento, costos y proyección operativa."
      />
      
      <Box p="md">
        <ProjectStatistics />
      </Box>
    </Box>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Button, Select, Box, Group, Grid } from '@mantine/core';
import { IconFileAnalytics } from '@tabler/icons-react';
import { api } from '../services/api';

export default function LaporanFormal() {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ['foundation-report', month, year],
    queryFn: async () => {
      const response = await api.get(`/reports/foundation?month=${month}&year=${year}`);
      return response.data;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <Box>
      <Title order={2} mb="lg">Laporan Formal Yayasan</Title>

      <Paper withBorder p="md" radius="md" mb="lg">
        <Group>
          <Select
            label="Bulan"
            data={monthNames.map((name, idx) => ({ value: String(idx + 1), label: name }))}
            value={String(month)}
            onChange={(val) => setMonth(Number(val))}
            w={150}
          />
          <Select
            label="Tahun"
            data={[2023, 2024, 2025, 2026].map((y) => ({ value: String(y), label: String(y) }))}
            value={String(year)}
            onChange={(val) => setYear(Number(val))}
            w={100}
          />
          <Button mt={28} leftSection={<IconFileAnalytics size={18} />}>
            Generate Laporan
          </Button>
        </Group>
      </Paper>

      {data?.settings && (
        <Paper withBorder p="xl" radius="md" bg="white">
          <Box ta="center" mb="xl">
            <Text fw={700} size="lg">{data.settings.foundationName}</Text>
            <Text size="sm">{data.settings.officeAddress}</Text>
            <Text size="sm">Telp: {data.settings.phone} | Email: {data.settings.email}</Text>
          </Box>

          <Title order={3} ta="center" mb="md">
            LAPORAN PENJUALAN BULAN {monthNames[month - 1].toUpperCase()} {year}
          </Title>

          <Grid mt="lg">
            <Grid.Col span={4}>
              <Paper p="md" withBorder radius="md" bg="gray.0">
                <Text size="sm" c="dimmed">Total Penjualan</Text>
                <Text fw={700} size="lg">{formatCurrency(data.summary?.totalPenjualan || 0)}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper p="md" withBorder radius="md" bg="gray.0">
                <Text size="sm" c="dimmed">Total Deal</Text>
                <Text fw={700} size="lg">{data.summary?.totalDeal || 0}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={4}>
              <Paper p="md" withBorder radius="md" bg="gray.0">
                <Text size="sm" c="dimmed">Total Qty</Text>
                <Text fw={700} size="lg">{data.summary?.totalQty || 0}</Text>
              </Paper>
            </Grid.Col>
          </Grid>

          <Box ta="center" mt="xl">
            <Text size="xs" c="dimmed">
              Laporan ini dibuat secara otomatis oleh sistem YBMBKI
            </Text>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

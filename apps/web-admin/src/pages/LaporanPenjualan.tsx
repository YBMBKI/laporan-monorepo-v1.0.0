import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Button, Box, Select, Stack, Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconDownload } from '@tabler/icons-react';
import { api } from '../services/api';

export default function LaporanPenjualan() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sales-report', startDate, endDate, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (statusFilter) params.append('statusId', statusFilter);
      const response = await api.get(`/reports/sales?${params}`);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Box>
      <Title order={2} mb="lg">Laporan Penjualan</Title>

      <Paper withBorder p="md" radius="md" mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <DatePickerInput
              label="Tanggal Mulai"
              placeholder="Pilih tanggal"
              value={startDate}
              onChange={setStartDate}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <DatePickerInput
              label="Tanggal Selesai"
              placeholder="Pilih tanggal"
              value={endDate}
              onChange={setEndDate}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label="Status"
              placeholder="Semua Status"
              data={[
                { value: 'deal', label: 'Deal' },
                { value: 'pending', label: 'Pending' },
                { value: 'terkirim', label: 'Terkirim' },
                { value: 'cancel', label: 'Cancel' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button
              mt={28}
              leftSection={<IconDownload size={18} />}
              onClick={() => {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate.toISOString());
                if (endDate) params.append('endDate', endDate.toISOString());
                window.open(`/api/reports/sales/export-xlsx?${params}`, '_blank');
              }}
            >
              Export Excel
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>

      {data?.summary && (
        <Grid mb="lg">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed">Total Penjualan</Text>
              <Text fw={700} size="xl">{formatCurrency(data.summary.totalPenjualan)}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed">Total Qty</Text>
              <Text fw={700} size="xl">{data.summary.totalQty}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed">Total Deal</Text>
              <Text fw={700} size="xl">{data.summary.totalDeal}</Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed">Conversion Rate</Text>
              <Text fw={700} size="xl">{data.summary.conversionRate.toFixed(1)}%</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      )}

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">Detail Penjualan</Title>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tanggal</Table.Th>
                <Table.Th>Nama Kegiatan</Table.Th>
                <Table.Th>Wilayah</Table.Th>
                <Table.Th>Anggota</Table.Th>
                <Table.Th>Produk</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Harga</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.orders?.slice(0, 100).map((order: any, index: number) => (
                <Table.Tr key={index}>
                  <Table.Td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</Table.Td>
                  <Table.Td>{order.activity?.nama_kegiatann || '-'}</Table.Td>
                  <Table.Td>{order.activity?.branch?.wilayahKabupaten || '-'}</Table.Td>
                  <Table.Td>{order.member?.namaAnggota || '-'}</Table.Td>
                  <Table.Td>{order.product?.namaProduk}</Table.Td>
                  <Table.Td>{order.qty}</Table.Td>
                  <Table.Td>{formatCurrency(order.hargaSatuan)}</Table.Td>
                  <Table.Td>{formatCurrency(order.totalHarga)}</Table.Td>
                  <Table.Td>
                    <Badge color={order.status?.code === 'deal' ? 'green' : order.status?.code === 'cancel' ? 'red' : 'yellow'}>
                      {order.status?.name}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
              {(!data?.orders || data.orders.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={9} ta="center" c="dimmed">
                    Tidak ada data
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Box, Select, Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { api } from '../services/api';

export default function PerformaAnggota() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [branchId, setBranchId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['performance-report', startDate, endDate, branchId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (branchId) params.append('branchId', branchId);
      const response = await api.get(`/reports/performance?${params}`);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Box>
      <Title order={2} mb="lg">Monitoring Performa Anggota</Title>

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
              label="Cabang"
              placeholder="Semua Cabang"
              data={[
                { value: 'C001', label: 'Pucang - Bawang' },
                { value: 'C002', label: 'Kaliori - Banyumas' },
                { value: 'C003', label: 'Purbalingga' },
              ]}
              value={branchId}
              onChange={setBranchId}
              clearable
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ranking</Table.Th>
              <Table.Th>Kode</Table.Th>
              <Table.Th>Nama Anggota</Table.Th>
              <Table.Th>Cabang</Table.Th>
              <Table.Th>Total Deal</Table.Th>
              <Table.Th>Total Qty</Table.Th>
              <Table.Th>Total Penjualan</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.map((member: any, index: number) => (
              <Table.Tr key={member.memberId}>
                <Table.Td>
                  <Badge color={index === 0 ? 'gold' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'blue'}>
                    #{index + 1}
                  </Badge>
                </Table.Td>
                <Table.Td>{member.kodeAnggota}</Table.Td>
                <Table.Td>{member.namaAnggota}</Table.Td>
                <Table.Td>{member.branch || '-'}</Table.Td>
                <Table.Td>{member.totalDeal}</Table.Td>
                <Table.Td>{member.totalQtyDeal}</Table.Td>
                <Table.Td>{formatCurrency(member.totalSalesAmount)}</Table.Td>
              </Table.Tr>
            ))}
            {(!data || data.length === 0) && (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center" c="dimmed">
                  Tidak ada data
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
}

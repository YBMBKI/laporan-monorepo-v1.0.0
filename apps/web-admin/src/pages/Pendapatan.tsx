import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Box, Select, Grid, Button, Modal, NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { api } from '../services/api';

export default function Pendapatan() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: memberData } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await api.get('/members');
      return response.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', startDate, endDate, selectedMember],
    queryFn: async () => {
      if (!selectedMember) return null;
      const response = await api.post(`/payroll/calculate/${selectedMember}`, {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      return response.data;
    },
    enabled: !!selectedMember && !!startDate && !!endDate,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Box>
      <Title order={2} mb="lg">Pendapatan / Gaji Anggota</Title>

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
              label="Pilih Anggota"
              placeholder="Pilih anggota"
              data={memberData?.map((m: any) => ({ value: m.id, label: `${m.kodeAnggota} - ${m.namaAnggota}` })) || []}
              value={selectedMember}
              onChange={setSelectedMember}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Button mt={28} onClick={() => setShowModal(true)}>
              Generate Payroll
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>

      {data && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">Rincian Pendapatan</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder radius="md" bg="green.0">
                <Text size="sm" c="dimmed">Total Deal</Text>
                <Text fw={700} size="xl">{data.totalDealCount}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder radius="md" bg="blue.0">
                <Text size="sm" c="dimmed">Total Qty Deal</Text>
                <Text fw={700} size="xl">{data.totalQtyDeal}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder radius="md" bg="grape.0">
                <Text size="sm" c="dimmed">Total Penjualan</Text>
                <Text fw={700} size="xl">{formatCurrency(data.totalSalesAmount)}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" withBorder radius="md" bg="yellow.0">
                <Text size="sm" c="dimmed">Total Insentif</Text>
                <Text fw={700} size="xl">{formatCurrency(data.incentiveAmount)}</Text>
              </Paper>
            </Grid.Col>
          </Grid>

          <Text fw={600} mt="lg" mb="sm">Rincian per Jabatan:</Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Jabatan Kegiatan</Table.Th>
                <Table.Th>Insentif</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(data.incentiveByPosition || {}).map(([position, amount]) => (
                <Table.Tr key={position}>
                  <Table.Td>{position}</Table.Td>
                  <Table.Td>{formatCurrency(amount as number)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

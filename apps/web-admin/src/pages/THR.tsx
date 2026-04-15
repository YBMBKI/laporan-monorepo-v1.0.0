import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Box, Select, Grid, Button, NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { api } from '../services/api';

export default function THR() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [pointPerQty, setPointPerQty] = useState<number>(1);
  const [rupiahPerPoint, setRupiahPerPoint] = useState<number>(1000);

  const { data: memberData } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const response = await api.get('/members');
      return response.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['thr', startDate, endDate, selectedMember],
    queryFn: async () => {
      if (!selectedMember) return null;
      const response = await api.get(`/thr/calculate/${selectedMember}`, {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          pointPerQty,
          rupiahPerPoint,
        },
      });
      return response.data;
    },
    enabled: !!selectedMember && !!startDate && !!endDate,
  });

  const { data: allThrData, isLoading: allThrLoading } = useQuery({
    queryKey: ['thr-all', startDate, endDate, pointPerQty, rupiahPerPoint],
    queryFn: async () => {
      const response = await api.post('/thr/calculate-all', {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        pointPerQty,
        rupiahPerPoint,
      });
      return response.data;
    },
    enabled: !selectedMember && !!startDate && !!endDate,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Box>
      <Title order={2} mb="lg">THR (Tunjangan Hari Raya)</Title>

      <Paper withBorder p="md" radius="md" mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <DatePickerInput
              label="Tanggal Mulai"
              placeholder="Pilih tanggal"
              value={startDate}
              onChange={setStartDate}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <DatePickerInput
              label="Tanggal Selesai"
              placeholder="Pilih tanggal"
              value={endDate}
              onChange={setEndDate}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Select
              label="Pilih Anggota"
              placeholder="Semua Anggota"
              data={memberData?.map((m: any) => ({ value: m.id, label: `${m.kodeAnggota} - ${m.namaAnggota}` })) || []}
              value={selectedMember}
              onChange={setSelectedMember}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <NumberInput
              label="Point per Qty"
              value={pointPerQty}
              onChange={setPointPerQty}
              min={1}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <NumberInput
              label="Rupiah per Point"
              value={rupiahPerPoint}
              onChange={setRupiahPerPoint}
              min={0}
              prefix="Rp "
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {selectedMember && data && (
        <Paper withBorder p="md" radius="md" mb="lg">
          <Title order={4} mb="md">Rincian THR</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper p="md" withBorder radius="md" bg="green.0">
                <Text size="sm" c="dimmed">Total Qty Deal</Text>
                <Text fw={700} size="xl">{data.totalQtyDeal}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper p="md" withBorder radius="md" bg="blue.0">
                <Text size="sm" c="dimmed">Total Points</Text>
                <Text fw={700} size="xl">{data.totalPoints}</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper p="md" withBorder radius="md" bg="yellow.0">
                <Text size="sm" c="dimmed">Total THR</Text>
                <Text fw={700} size="xl">{formatCurrency(data.thrAmount)}</Text>
              </Paper>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      {!selectedMember && allThrData && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">Rekap THR Semua Anggota</Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Kode</Table.Th>
                <Table.Th>Nama Anggota</Table.Th>
                <Table.Th>Total Qty Deal</Table.Th>
                <Table.Th>Total Points</Table.Th>
                <Table.Th>Total THR</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allThrData.map((member: any, index: number) => (
                <Table.Tr key={member.memberId}>
                  <Table.Td>{member.kodeAnggota}</Table.Td>
                  <Table.Td>{member.namaAnggota}</Table.Td>
                  <Table.Td>{member.totalQtyDeal}</Table.Td>
                  <Table.Td>{member.totalPoints}</Table.Td>
                  <Table.Td>
                    <Text fw={700}>{formatCurrency(member.thrAmount)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

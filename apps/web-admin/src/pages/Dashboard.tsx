import { useQuery } from '@tanstack/react-query';
import { Grid, Paper, Title, Text, Group, RingProgress, ThemeIcon, Table, Badge, Box } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconCash, IconUsers, IconBuilding, IconFileImport } from '@tabler/icons-react';
import { api } from '../services/api';

interface DashboardSummary {
  today: { totalOrders: number; totalPenjualan: number };
  month: { totalOrders: number; totalPenjualan: number; totalDeal: number };
  totals: { totalMembers: number; activeMembers: number; totalBranches: number; pendingImports: number };
  topPerformers: Array<{ memberId: string; namaAnggota: string; totalSales: number; dealCount: number }>;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      return response.data;
    },
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Box>
      <Title order={2} mb="lg">Dashboard</Title>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Penjualan Hari Ini</Text>
                <Text fw={700} size="xl">{formatCurrency(data?.today.totalPenjualan || 0)}</Text>
              </div>
              <ThemeIcon color="red" variant="light" size="lg" radius="md">
                <IconCash size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Penjualan Bulan Ini</Text>
                <Text fw={700} size="xl">{formatCurrency(data?.month.totalPenjualan || 0)}</Text>
              </div>
              <ThemeIcon color="green" variant="light" size="lg" radius="md">
                <IconArrowUpRight size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Deal Bulan Ini</Text>
                <Text fw={700} size="xl">{data?.month.totalDeal || 0}</Text>
              </div>
              <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                <IconUsers size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Anggota Aktif</Text>
                <Text fw={700} size="xl">{data?.totals.activeMembers || 0} / {data?.totals.totalMembers || 0}</Text>
              </div>
              <ThemeIcon color="grape" variant="light" size="lg" radius="md">
                <IconBuilding size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Top Performer Bulan Ini</Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ranking</Table.Th>
                  <Table.Th>Nama Anggota</Table.Th>
                  <Table.Th>Total Deal</Table.Th>
                  <Table.Th>Total Penjualan</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.topPerformers.map((performer, index) => (
                  <Table.Tr key={performer.memberId}>
                    <Table.Td>
                      <Badge color={index === 0 ? 'gold' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'blue'}>
                        #{index + 1}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{performer.namaAnggota}</Table.Td>
                    <Table.Td>{performer.dealCount}</Table.Td>
                    <Table.Td>{formatCurrency(performer.totalSales)}</Table.Td>
                  </Table.Tr>
                ))}
                {(!data?.topPerformers || data.topPerformers.length === 0) && (
                  <Table.Tr>
                    <Table.Td colSpan={4} ta="center" c="dimmed">Belum ada data</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Statistik</Title>
            <Group justify="center">
              <RingProgress
                size={150}
                thickness={15}
                roundCaps
                sections={[
                  { value: ((data?.month.totalDeal || 0) / (data?.month.totalOrders || 1)) * 100, color: 'green' },
                ]}
                label={
                  <Text ta="center" size="lg" fw={700}>
                    {Math.round(((data?.month.totalDeal || 0) / (data?.month.totalOrders || 1)) * 100)}%
                  </Text>
                }
              />
            </Group>
            <Text size="sm" c="dimmed" ta="center" mt="sm">
              Conversion Rate ke Deal
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

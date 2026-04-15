import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Box, Tabs, Button, ActionIcon, Modal, TextInput, Select, NumberInput } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { api } from '../services/api';

const tabs = [
  { value: 'members', label: 'Anggota', endpoint: '/members', fields: ['kodeAnggota', 'namaAnggota', 'branchId', 'positionId', 'noHp', 'alamat'] },
  { value: 'branches', label: 'Cabang', endpoint: '/branches', fields: ['kodeCabang', 'wilayahKelompok', 'wilayahKabupaten', 'wilayahProvinsi', 'alamatCabang'] },
  { value: 'products', label: 'Produk', endpoint: '/products', fields: ['kodeProduk', 'namaProduk', 'kategori', 'hargaDefault', 'pointThrDefault'] },
  { value: 'activity-positions', label: 'Jabatan Kegiatan', endpoint: '/settings/activity-positions', fields: ['code', 'name', 'incentivePerDeal'] },
  { value: 'order-statuses', label: 'Status Order', endpoint: '/settings/order-statuses', fields: ['code', 'name', 'sortOrder', 'isDeal', 'colorTag'] },
  { value: 'golongans', label: 'Golongan', endpoint: '/settings/golongans', fields: ['code', 'name', 'description'] },
];

export default function MasterData() {
  const [activeTab, setActiveTab] = useState<string | null>('members');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const currentTab = tabs.find(t => t.value === activeTab);

  const { data, refetch } = useQuery({
    queryKey: [currentTab?.endpoint],
    queryFn: async () => {
      const response = await api.get(currentTab?.endpoint || '');
      return response.data;
    },
  });

  return (
    <Box>
      <Title order={2} mb="lg">Master Data</Title>

      <Paper withBorder p="md" radius="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value}>{tab.label}</Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <Box mt="md">
          <Group justify="space-between" mb="md">
            <Text size="sm" c="dimmed">Total: {data?.length || 0} data</Text>
            <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => setModalOpen(true)}>
              Tambah {currentTab?.label}
            </Button>
          </Group>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>No</Table.Th>
                {currentTab?.fields.map((field) => (
                  <Table.Th key={field}>{field}</Table.Th>
                ))}
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.map((item: any, index: number) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{index + 1}</Table.Td>
                  {currentTab?.fields.map((field) => (
                    <Table.Td key={field}>
                      {field.includes('hargaDefault') || field.includes('incentivePerDeal') || field.includes('pointThrDefault') 
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item[field] || 0)
                        : field === 'isDeal' 
                          ? <Badge color={item[field] ? 'green' : 'gray'}>{item[field] ? 'Yes' : 'No'}</Badge>
                          : item[field]?.toString() || '-'}
                    </Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue" size="sm" onClick={() => { setEditData(item); setModalOpen(true); }}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="red" size="sm">
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {(!data || data.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={currentTab?.fields.length + 2} ta="center" c="dimmed">
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

import { useQuery } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Button, Box, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconCheck, IconX } from '@tabler/icons-react';
import { api } from '../services/api';

interface Import {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  uploader: { fullName: string };
}

const statusColors: Record<string, string> = {
  draft: 'yellow',
  validated: 'blue',
  imported: 'green',
  rejected: 'red',
  partial_success: 'orange',
};

export default function RiwayatImport() {
  const { data, isLoading } = useQuery<Import[]>({
    queryKey: ['imports'],
    queryFn: async () => {
      const response = await api.get('/imports');
      return response.data;
    },
  });

  return (
    <Box>
      <Title order={2} mb="lg">Riwayat Import</Title>

      <Paper withBorder p="md" radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>No</Table.Th>
              <Table.Th>Nama File</Table.Th>
              <Table.Th>Diupload Oleh</Table.Th>
              <Table.Th>Tanggal</Table.Th>
              <Table.Th>Total Rows</Table.Th>
              <Table.Th>Valid</Table.Th>
              <Table.Th>Invalid</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.map((item, index) => (
              <Table.Tr key={item.id}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>{item.fileName}</Table.Td>
                <Table.Td>{item.uploader?.fullName || '-'}</Table.Td>
                <Table.Td>{new Date(item.uploadedAt).toLocaleDateString('id-ID')}</Table.Td>
                <Table.Td>{item.totalRows}</Table.Td>
                <Table.Td>
                  <Badge color="green">{item.validRows}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color="red">{item.invalidRows}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={statusColors[item.status] || 'gray'}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Lihat Detail">
                      <ActionIcon variant="light" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {(!data || data.length === 0) && (
              <Table.Tr>
                <Table.Td colSpan={9} ta="center" c="dimmed">
                  Belum ada data import
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
}

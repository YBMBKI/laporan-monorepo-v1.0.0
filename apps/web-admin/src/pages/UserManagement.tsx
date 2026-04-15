import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paper, Title, Text, Table, Badge, Group, Button, Box, ActionIcon, Modal, TextInput, Select, Switch } from '@mantine/core';
import { useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconUserCircle } from '@tabler/icons-react';
import { api } from '../services/api';
import { notifications } from '@mantine/notifications';

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      notifications.show({ title: 'Berhasil', message: 'User dihapus', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/users/${id}/toggle-active`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const roleColors: Record<string, string> = {
    super_admin: 'red',
    admin_yayasan: 'blue',
    koordinator: 'green',
    anggota: 'gray',
    viewer: 'yellow',
  };

  return (
    <Box>
      <Title order={2} mb="lg">Manajemen User</Title>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="dimmed">Total: {data?.length || 0} user</Text>
          <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditData(null); setModalOpen(true); }}>
            Tambah User
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>No</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Nama Lengkap</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.map((user: any, index: number) => (
              <Table.Tr key={user.id}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.fullName}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>
                  <Badge color={roleColors[user.role] || 'gray'} tt="capitalize">
                    {user.role.replace('_', ' ')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={user.isActive ? 'green' : 'red'}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon 
                      variant="light" 
                      color={user.isActive ? 'red' : 'green'} 
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate(user.id)}
                    >
                      {user.isActive ? <IconTrash size={14} /> : <IconUserCircle size={14} />}
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {(!data || data.length === 0) && (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center" c="dimmed">
                  Tidak ada user
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
}

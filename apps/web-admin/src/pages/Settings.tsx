import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paper, Title, Text, Button, TextInput, Grid, Box, Group, Stack, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { api } from '../services/api';
import { notifications } from '@mantine/notifications';

export default function Settings() {
  const queryClient = useQueryClient();
  
  const { data: foundation } = useQuery({
    queryKey: ['foundation-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/foundation');
      return response.data;
    },
  });

  const { data: payrollRules } = useQuery({
    queryKey: ['payroll-rules'],
    queryFn: async () => {
      const response = await api.get('/payroll/rules');
      return response.data;
    },
  });

  const { data: thrRules } = useQuery({
    queryKey: ['thr-rules'],
    queryFn: async () => {
      const response = await api.get('/thr/rules');
      return response.data;
    },
  });

  const foundationForm = useForm({
    initialValues: {
      foundationName: foundation?.foundationName || '',
      officeName: foundation?.officeName || '',
      officeAddress: foundation?.officeAddress || '',
      city: foundation?.city || '',
      province: foundation?.province || '',
      phone: foundation?.phone || '',
      email: foundation?.email || '',
      reportSignatureName: foundation?.reportSignatureName || '',
      reportSignatureTitle: foundation?.reportSignatureTitle || '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/settings/foundation', data);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({ title: 'Berhasil', message: 'Pengaturan yayasan disimpan', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['foundation-settings'] });
    },
    onError: () => {
      notifications.show({ title: 'Gagal', message: 'Gagal menyimpan pengaturan', color: 'red' });
    },
  });

  return (
    <Box>
      <Title order={2} mb="lg">Pengaturan</Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Identitas Yayasan</Title>
            <form onSubmit={foundationForm.onSubmit((values) => saveMutation.mutate(values))}>
              <Stack>
                <TextInput label="Nama Yayasan" {...foundationForm.getInputProps('foundationName')} />
                <TextInput label="Nama Kantor" {...foundationForm.getInputProps('officeName')} />
                <TextInput label="Alamat Kantor" {...foundationForm.getInputProps('officeAddress')} />
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput label="Kota" {...foundationForm.getInputProps('city')} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Provinsi" {...foundationForm.getInputProps('province')} />
                  </Grid.Col>
                </Grid>
                <TextInput label="Telepon" {...foundationForm.getInputProps('phone')} />
                <TextInput label="Email" {...foundationForm.getInputProps('email')} />
                <Button type="submit" loading={saveMutation.isPending}>Simpan</Button>
              </Stack>
            </form>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" mb="md">
            <Title order={4} mb="md">Tanda Tangan Laporan</Title>
            <Stack>
              <TextInput label="Nama Penandatangan" {...foundationForm.getInputProps('reportSignatureName')} />
              <TextInput label="Jabatan Penandatangan" {...foundationForm.getInputProps('reportSignatureTitle')} />
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">Rule THR</Title>
            <Stack>
              {thrRules?.map((rule: any) => (
                <Paper key={rule.id} p="sm" withBorder radius="md">
                  <Text fw={600}>{rule.ruleCode}</Text>
                  <Text size="sm" c="dimmed">
                    {rule.pointPerQty} point per qty × Rp {rule.rupiahPerPoint.toLocaleString('id-ID')} = THR
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

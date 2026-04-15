import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Paper, Title, Text, Button, Group, Table, Badge, Box, FileButton, Alert, Progress } from '@mantine/core';
import { IconUpload, IconFileSpreadsheet, IconCheck, IconX } from '@tabler/icons-react';
import { api } from '../services/api';
import { notifications } from '@mantine/notifications';

export default function KirimLaporan() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<{ validCount: number; invalidCount: number } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/imports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPreviewData(data.rows || []);
      notifications.show({
        title: 'Berhasil',
        message: `File berhasil diupload. ${data.import.totalRows} baris data.`,
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Gagal',
        message: error.response?.data?.message || 'Upload gagal',
        color: 'red',
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (importId: string) => {
      const response = await api.post(`/imports/${importId}/validate`);
      return response.data;
    },
    onSuccess: (data) => {
      setValidationResult({ validCount: data.validCount, invalidCount: data.invalidCount });
      notifications.show({
        title: 'Validasi Selesai',
        message: `${data.validCount} valid, ${data.invalidCount} invalid`,
        color: data.invalidCount > 0 ? 'yellow' : 'green',
      });
    },
  });

  const commitMutation = useMutation({
    mutationFn: async (importId: string) => {
      const response = await api.post(`/imports/${importId}/commit`);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Data berhasil diimport ke database',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      setPreviewData([]);
      setValidationResult(null);
      navigate('/riwayat-import');
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Gagal',
        message: error.response?.data?.message || 'Import gagal',
        color: 'red',
      });
    },
  });

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewData([]);
    setValidationResult(null);
    await uploadMutation.mutateAsync(file);
  };

  const handleValidate = async () => {
    if (previewData.length > 0) {
      await validateMutation.mutateAsync(previewData[0]?.importId || '');
    }
  };

  const handleCommit = async () => {
    if (previewData.length > 0) {
      await commitMutation.mutateAsync(previewData[0]?.importId || '');
    }
  };

  return (
    <Box>
      <Title order={2} mb="lg">Kirim Laporan</Title>

      <Paper withBorder p="md" radius="md" mb="lg">
        <Title order={4} mb="md">Upload File Laporan</Title>
        <Text size="sm" c="dimmed" mb="md">
          Download template terlebih dahulu, isi sesuai format, lalu upload kembali ke sistem.
        </Text>
        
        <Group>
          <Button
            variant="light"
            leftSection={<IconFileSpreadsheet size={18} />}
            onClick={async () => {
              try {
                const resp = await api.post('/imports/template/create-drive');
                const url = resp.data?.url || resp.data?.fallbackDownloadUrl;
                if (url) window.open(url, '_blank');
                else notifications.show({ title: 'Gagal', message: resp.data?.message || 'Tidak dapat membuat template', color: 'red' });
              } catch (err: any) {
                notifications.show({ title: 'Gagal', message: err?.response?.data?.message || err.message || 'Terjadi kesalahan', color: 'red' });
              }
            }}
          >
            Download Template
          </Button>
          
          <FileButton onChange={handleFileSelect} accept=".xlsx,.xls">
            {(props) => (
              <Button
                {...props}
                leftSection={<IconUpload size={18} />}
                loading={uploadMutation.isPending}
              >
                Upload File
              </Button>
            )}
          </FileButton>
        </Group>
      </Paper>

      {selectedFile && (
        <Paper withBorder p="md" radius="md" mb="lg">
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={600}>File: {selectedFile.name}</Text>
              <Text size="sm" c="dimmed">{(selectedFile.size / 1024).toFixed(2)} KB</Text>
            </div>
            {validationResult && (
              <Group>
                <Badge leftSection={<IconCheck size={12} />} color="green">
                  {validationResult.validCount} Valid
                </Badge>
                {validationResult.invalidCount > 0 && (
                  <Badge leftSection={<IconX size={12} />} color="red">
                    {validationResult.invalidCount} Invalid
                  </Badge>
                )}
              </Group>
            )}
          </Group>

          {!validationResult && (
            <Alert color="blue" mb="md">
              Klik "Validasi" untuk memeriksa data sebelum diimport.
            </Alert>
          )}

          <Group>
            {!validationResult && (
              <Button
                onClick={handleValidate}
                loading={validateMutation.isPending}
                disabled={previewData.length === 0}
              >
                Validasi Data
              </Button>
            )}
            {validationResult && (
              <Button
                onClick={handleCommit}
                loading={commitMutation.isPending}
                color="green"
              >
                Import ke Database
              </Button>
            )}
          </Group>
        </Paper>
      )}

      {previewData.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="md">Preview Data ({previewData.length} baris)</Title>
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>No</Table.Th>
                  <Table.Th>Tanggal</Table.Th>
                  <Table.Th>Nama Kegiatan</Table.Th>
                  <Table.Th>Wilayah</Table.Th>
                  <Table.Th>Koordinator</Table.Th>
                  <Table.Th>Anggota</Table.Th>
                  <Table.Th>Jabatan</Table.Th>
                  <Table.Th>Produk</Table.Th>
                  <Table.Th>Qty</Table.Th>
                  <Table.Th>Harga</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {previewData.slice(0, 50).map((row: any, index: number) => (
                  <Table.Tr key={index}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{row.tanggal_kegiatann}</Table.Td>
                    <Table.Td>{row.nama_kegiatann}</Table.Td>
                    <Table.Td>{row.wilayah_kabupaten}</Table.Td>
                    <Table.Td>{row.nama_koordinator}</Table.Td>
                    <Table.Td>{row.nama_anggota}</Table.Td>
                    <Table.Td>{row.jabatan_kegiatann}</Table.Td>
                    <Table.Td>{row.nama_produk}</Table.Td>
                    <Table.Td>{row.qty}</Table.Td>
                    <Table.Td>{row.harga_satuan}</Table.Td>
                    <Table.Td>{(row.qty * row.harga_satuan).toLocaleString('id-ID')}</Table.Td>
                    <Table.Td>
                      <Badge color={row.status_order === 'deal' ? 'green' : row.status_order === 'cancel' ? 'red' : 'yellow'}>
                        {row.status_order}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
          {previewData.length > 50 && (
            <Text size="sm" c="dimmed" mt="md">
              Menampilkan 50 dari {previewData.length} baris
            </Text>
          )}
        </Paper>
      )}
    </Box>
  );
}

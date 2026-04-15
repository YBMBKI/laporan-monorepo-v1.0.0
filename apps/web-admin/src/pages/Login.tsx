import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Alert, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 1 ? 'Username wajib diisi' : null),
      password: (value) => (value.length < 1 ? 'Password wajib diisi' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.username, values.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F6F8',
      }}
    >
      <Container size={420} my={40}>
        <Title ta="center" order={1} fw={700}>
          <Text span c="red.6">YBMBKI</Text>
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Management Laporan Kegiatan
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            {error && (
              <Alert color="red" mb="md">
                {error}
              </Alert>
            )}
            <TextInput
              label="Username"
              placeholder="Masukkan username"
              required
              {...form.getInputProps('username')}
              size="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Masukkan password"
              required
              mt="md"
              {...form.getInputProps('password')}
              size="md"
            />
            <Button type="submit" fullWidth mt="xl" loading={loading} size="md">
              Masuk
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

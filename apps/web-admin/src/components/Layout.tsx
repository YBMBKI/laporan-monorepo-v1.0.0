import { AppShell, Group, Text, Burger, rem, NavLink, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconUpload, IconHistory, IconChartBar, IconFileAnalytics, IconUsers, IconCurrencyDollar, IconGift, IconSettings, IconUserCircle, IconBuilding, IconPackage } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  opened: boolean;
  toggle: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: IconDashboard, path: '/dashboard' },
  { label: 'Kirim Laporan', icon: IconUpload, path: '/kirim-laporan' },
  { label: 'Riwayat Import', icon: IconHistory, path: '/riwayat-import' },
  { label: 'Laporan Penjualan', icon: IconChartBar, path: '/laporan-penjualan' },
  { label: 'Laporan Formal', icon: IconFileAnalytics, path: '/laporan-formal' },
  { label: 'Performa Anggota', icon: IconUsers, path: '/performa-anggota' },
  { label: 'Pendapatan', icon: IconCurrencyDollar, path: '/pendapatan' },
  { label: 'THR', icon: IconGift, path: '/thr' },
  { label: 'Master Data', icon: IconPackage, path: '/master-data' },
  { label: 'Pengaturan', icon: IconSettings, path: '/settings' },
];

const adminItems = [
  { label: 'User Management', icon: IconUserCircle, path: '/user-management' },
];

export default function Layout({ children, opened, toggle }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_yayasan';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={{
        main: {
          background: '#F5F6F8',
          minHeight: '100vh',
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <Text fw={700} size="lg" c="red.6">YBMBKI</Text>
              <Text size="sm" c="dimmed">Management Laporan</Text>
            </Group>
          </Group>
          <Group gap="md">
            <Text size="sm">{user?.fullName}</Text>
            <Text size="xs" c="dimmed" tt="capitalize">{user?.role?.replace('_', ' ')}</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              styles={{
                root: {
                  borderRadius: 8,
                  marginBottom: 4,
                },
              }}
            />
          ))}
        </AppShell.Section>

        {isAdmin && (
          <AppShell.Section mt="lg">
            <Text size="xs" fw={600} c="dimmed" mb="xs" px="md">
              ADMIN
            </Text>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<item.icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                styles={{
                  root: {
                    borderRadius: 8,
                    marginBottom: 4,
                  },
                }}
              />
            ))}
          </AppShell.Section>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Box pt="lg">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

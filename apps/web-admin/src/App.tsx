import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KirimLaporan from './pages/KirimLaporan';
import RiwayatImport from './pages/RiwayatImport';
import LaporanPenjualan from './pages/LaporanPenjualan';
import LaporanFormal from './pages/LaporanFormal';
import PerformaAnggota from './pages/PerformaAnggota';
import Pendapatan from './pages/Pendapatan';
import THR from './pages/THR';
import MasterData from './pages/MasterData';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout opened={opened} toggle={toggle}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/kirim-laporan" element={<KirimLaporan />} />
                <Route path="/riwayat-import" element={<RiwayatImport />} />
                <Route path="/laporan-penjualan" element={<LaporanPenjualan />} />
                <Route path="/laporan-formal" element={<LaporanFormal />} />
                <Route path="/performa-anggota" element={<PerformaAnggota />} />
                <Route path="/pendapatan" element={<Pendapatan />} />
                <Route path="/thr" element={<THR />} />
                <Route path="/master-data" element={<MasterData />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user-management" element={<UserManagement />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

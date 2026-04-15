import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'admin@ybmbki.org',
      username: 'admin',
      passwordHash,
      role: 'super_admin',
    },
  });
  console.log('Created admin user:', adminUser.username);

  const koordinatorUser = await prisma.user.upsert({
    where: { username: 'koordinator' },
    update: {},
    create: {
      fullName: 'Ahmad Santoso',
      email: 'koordinator@ybmbki.org',
      username: 'koordinator',
      passwordHash,
      role: 'koordinator',
    },
  });
  console.log('Created koordinator user:', koordinatorUser.username);

  await prisma.memberPosition.createMany({
    data: [
      { code: 'koordinator', name: 'Koordinator', description: 'Koordinator wilayah' },
      { code: 'anggota', name: 'Anggota', description: 'Anggota aktif' },
    ],
    skipDuplicates: true,
  });

  await prisma.activityPosition.createMany({
    data: [
      { code: 'konsultan', name: 'Konsultan', incentivePerDeal: 100000, isActive: true },
      { code: 'surveyor', name: 'Surveyor', incentivePerDeal: 50000, isActive: true },
      { code: 'pribadi', name: 'Pribadi', incentivePerDeal: 150000, isActive: true },
    ],
    skipDuplicates: true,
  });

  await prisma.branch.createMany({
    data: [
      { kodeCabang: 'C001', wilayahKelompok: 'Pucang', wilayahKabupaten: 'Bawang', wilayahProvinsi: 'Jawa Tengah', alamatCabang: 'Jl. Kyai Pança, Pucang, Bawang, Banjarnégara' },
      { kodeCabang: 'C002', wilayahKelompok: 'Kaliori', wilayahKabupaten: 'Banyumas', wilayahProvinsi: 'Jawa Tengah', alamatCabang: 'Kaliori, Banyumas' },
      { kodeCabang: 'C003', wilayahKelompok: 'Purbalingga', wilayahKabupaten: 'Purbalingga', wilayahProvinsi: 'Jawa Tengah', alamatCabang: 'Purbalingga' },
    ],
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: [
      { kodeProduk: 'P001', namaProduk: 'Krim Malam', kategori: 'Perawatan', hargaDefault: 50000, pointThrDefault: 1 },
      { kodeProduk: 'P002', namaProduk: 'Krim Siang', kategori: 'Perawatan', hargaDefault: 45000, pointThrDefault: 1 },
      { kodeProduk: 'P003', namaProduk: 'Bedak Tabur', kategori: 'Makeup', hargaDefault: 35000, pointThrDefault: 1 },
      { kodeProduk: 'P004', namaProduk: 'Lipstik', kategori: 'Makeup', hargaDefault: 25000, pointThrDefault: 1 },
    ],
    skipDuplicates: true,
  });

  await prisma.orderStatus.createMany({
    data: [
      { code: 'pending', name: 'Pending', sortOrder: 1, isFinal: false, isDeal: false, colorTag: '#FFC107' },
      { code: 'terkirim', name: 'Terkirim', sortOrder: 2, isFinal: true, isDeal: false, colorTag: '#2196F3' },
      { code: 'deal', name: 'Deal', sortOrder: 3, isFinal: true, isDeal: true, colorTag: '#4CAF50' },
      { code: 'cancel', name: 'Cancel', sortOrder: 4, isFinal: true, isDeal: false, colorTag: '#F44336' },
    ],
    skipDuplicates: true,
  });

  await prisma.golongan.createMany({
    data: [
      { code: 'A', name: 'Golongan A', description: 'Premium customer' },
      { code: 'B', name: 'Golongan B', description: 'Regular customer' },
      { code: 'C', name: 'Golongan C', description: 'Basic customer' },
    ],
    skipDuplicates: true,
  });

  await prisma.payrollRule.createMany({
    data: [
      { ruleCode: 'konsultan_per_deal', ruleName: 'Insentif Konsultan per Deal', amountType: 'per_deal', amountValue: 100000, isActive: true },
      { ruleCode: 'surveyor_per_deal', ruleName: 'Insentif Surveyor per Deal', amountType: 'per_deal', amountValue: 50000, isActive: true },
      { ruleCode: 'pribadi_per_deal', ruleName: 'Insentif Pribadi per Deal', amountType: 'per_deal', amountValue: 150000, isActive: true },
    ],
    skipDuplicates: true,
  });

  await prisma.thrRule.createMany({
    data: [
      { ruleCode: 'default', pointPerQty: 1, rupiahPerPoint: 1000, isActive: true },
    ],
    skipDuplicates: true,
  });

  await prisma.foundationSettings.createMany({
    data: [
      {
        foundationName: 'YBMBKI',
        officeName: 'Kantor YBMBKI',
        officeAddress: 'Jl. Kyai Panca, Pucang, Bawang, Banjarnégara',
        city: 'Banjarnégara',
        province: 'Jawa Tengah',
        phone: '(0282) 123456',
        email: 'info@ybmbki.org',
      },
    ],
    skipDuplicates: true,
  });

  const members = await prisma.member.findMany();
  if (members.length === 0) {
    const coordinatorPosition = await prisma.memberPosition.findFirst({ where: { code: 'koordinator' } });
    const regularPosition = await prisma.memberPosition.findFirst({ where: { code: 'anggota' } });
    const branch = await prisma.branch.findFirst();

    if (coordinatorPosition && regularPosition && branch) {
      await prisma.member.createMany({
        data: [
          { kodeAnggota: 'M001', namaAnggota: 'Budi Susanto', branchId: branch.id, positionId: coordinatorPosition.id, noHp: '081234567890', alamat: 'Bawang' },
          { kodeAnggota: 'M002', namaAnggota: 'Siti Rahayu', branchId: branch.id, positionId: regularPosition.id, noHp: '081234567891', alamat: 'Banjarnégara' },
          { kodeAnggota: 'M003', namaAnggota: 'Joko Pramono', branchId: branch.id, positionId: regularPosition.id, noHp: '081234567892', alamat: 'Pucang' },
        ],
        skipDuplicates: true,
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

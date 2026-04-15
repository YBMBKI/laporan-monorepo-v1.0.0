import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // hashes for default passwords
  const adminHash = await bcrypt.hash('superadmin', 10);
  const masterHash = await bcrypt.hash('master123', 10);
  const memberHash = await bcrypt.hash('member123', 10);

  // master / admin accounts per request
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin@1000' },
    update: { passwordHash: adminHash },
    create: {
      fullName: 'Super Admin',
      email: 'admin+1000@ybmbki.org',
      username: 'admin@1000',
      passwordHash: adminHash,
      role: 'super_admin',
    },
  });
  console.log('Created admin user:', adminUser.username);

  const masterUser = await prisma.user.upsert({
    where: { username: 'master#1000' },
    update: { passwordHash: masterHash },
    create: {
      fullName: 'Master Account',
      email: 'master+1000@ybmbki.org',
      username: 'master#1000',
      passwordHash: masterHash,
      role: 'super_admin',
    },
  });
  console.log('Created master user:', masterUser.username);

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
      { kodeCabang: 'C001', wilayahKelompok: 'Pucang', wilayahKabupaten: 'Bawang', wilayahProvinsi: 'Jawa Tengah', alamatCabang: 'Jl. Kyai Panca, Pucang, Bawang, Banjarnégara' },
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

  // Create sample members and linked user accounts
  const coordinatorPosition = await prisma.memberPosition.findFirst({ where: { code: 'koordinator' } });
  const regularPosition = await prisma.memberPosition.findFirst({ where: { code: 'anggota' } });
  const branch = await prisma.branch.findFirst();

  if (branch && coordinatorPosition && regularPosition) {
    const membersData = [
      { kodeAnggota: 'M001', namaAnggota: 'Budi Susanto', positionId: coordinatorPosition.id, noHp: '081234567890', alamat: 'Bawang' },
      { kodeAnggota: 'M002', namaAnggota: 'Siti Rahayu', positionId: regularPosition.id, noHp: '081234567891', alamat: 'Banjarnégara' },
      { kodeAnggota: 'M003', namaAnggota: 'Joko Pramono', positionId: regularPosition.id, noHp: '081234567892', alamat: 'Pucang' },
      { kodeAnggota: 'M004', namaAnggota: 'Slamet Riyadi', positionId: regularPosition.id, noHp: '081234567893', alamat: 'Kaliori' },
      { kodeAnggota: 'M005', namaAnggota: 'Dewi Lestari', positionId: regularPosition.id, noHp: '081234567894', alamat: 'Purbalingga' },
      { kodeAnggota: 'M006', namaAnggota: 'Rina Wulandari', positionId: coordinatorPosition.id, noHp: '081234567895', alamat: 'Banyumas' },
    ];

    for (const m of membersData) {
      const member = await prisma.member.upsert({
        where: { kodeAnggota: m.kodeAnggota },
        update: {},
        create: {
          kodeAnggota: m.kodeAnggota,
          namaAnggota: m.namaAnggota,
          branchId: branch.id,
          positionId: m.positionId,
          noHp: m.noHp,
          alamat: m.alamat,
        },
      });

      // create user for member
      const username = `${m.namaAnggota.split(' ')[0].toLowerCase()}@1000`;
      await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
          fullName: m.namaAnggota,
          email: `${m.namaAnggota.split(' ')[0].toLowerCase()}+1000@ybmbki.org`,
          username,
          passwordHash: memberHash,
          role: 'anggota',
          memberId: member.id,
        },
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

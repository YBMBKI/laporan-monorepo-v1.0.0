import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MembersModule } from './members/members.module';
import { BranchesModule } from './branches/branches.module';
import { ProductsModule } from './products/products.module';
import { ActivitiesModule } from './activities/activities.module';
import { OrdersModule } from './orders/orders.module';
import { ImportsModule } from './imports/imports.module';
import { ReportsModule } from './reports/reports.module';
import { PayrollModule } from './payroll/payroll.module';
import { ThrModule } from './thr/thr.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    MembersModule,
    BranchesModule,
    ProductsModule,
    ActivitiesModule,
    OrdersModule,
    ImportsModule,
    ReportsModule,
    PayrollModule,
    ThrModule,
    SettingsModule,
    AuditLogModule,
    DashboardModule,
  ],
})
export class AppModule {}

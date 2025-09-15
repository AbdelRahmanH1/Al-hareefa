import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CompetitionService } from './competition/admin-competition.service';
import { CompetitionController } from './competition/admin-competition.controller';
import { ReportsController } from './reports/admin-reports.controller';
import { ReportsService } from './reports/admin-reports.service';
import { CompetitionTypeController } from './competition-type/admin-competition-type.controller';
import { CompetitionTypeService } from './competition-type/admin-competition-type.service';
import { OrganizationService } from './organization/admin-organization.service';
import { OrganizationController } from './organization/admin-organization.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminController,
    CompetitionController,
    ReportsController,
    CompetitionTypeController,
    OrganizationController,
  ],
  providers: [
    AdminService,
    CompetitionService,
    ReportsService,
    CompetitionTypeService,
    OrganizationService,
  ],
})
export class AdminModule {}

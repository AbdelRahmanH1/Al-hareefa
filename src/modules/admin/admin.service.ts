import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminRequest } from './dto/CreateAdminRequest.dto';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { FirebaseService } from '../auth/firebase/firebase.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async createAdmin(data: CreateAdminRequest) {
    const existingUser = await this.prisma.user.findUnique({
      where: { firebase_id: data.firebase_id },
    });

    if (existingUser) {
      if (existingUser.firebase_id == data.firebase_id)
        throw new BadRequestException('FirebaseId already exists');
      if (existingUser.email === data.email) {
        throw new BadRequestException('Email already in use');
      }
      if (existingUser.phone === data.phone) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    let newUser: any;

    try {
      newUser = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firebase_id: data.firebase_id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            role: UserRole.ADMIN,
            birth_date: new Date(data.birthDate),
            city: data.city,
            gender: data.gender,
            photo_url: data.photo_url || null,
          },
        });

        await tx.adminProfile.create({
          data: { id: createdUser.id, user_id: createdUser.id },
        });

        return createdUser;
      });

      await this.firebase.setCustomClaims(
        newUser.firebase_id,
        newUser.id,
        newUser.role,
      );

      return {
        success: true,
        message: 'Admin created successfully',
      };
    } catch (error) {
      if (newUser) {
        await this.prisma.$transaction(async (tx) => {
          await tx.adminProfile.deleteMany({ where: { user_id: newUser.id } });
          await tx.user.delete({ where: { id: newUser.id } });
        });
      }

      throw new BadRequestException(`Failed to create admin: ${error.message}`);
    }
  }

  /* async test() {
    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          city: 'Alexandria',
          email: 'admin@example.com',
          birth_date: new Date(),
          firebase_id: 'umzLBgDskdWStf0rnNOg03bYKhm1',
          full_name: 'Admin',
          gender: 'MALE',
          role: 'ADMIN',
          phone: '01022419956',
        },
      });
      await tx.adminProfile.create({
        data: {
          id: user.id,
          user_id: user.id,
        },
      });
      return user;
    });
    this.firebase.setCustomClaims(
      'umzLBgDskdWStf0rnNOg03bYKhm1',
      newUser.id,
      newUser.role,
    );
  } */
}

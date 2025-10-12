import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as admin from 'firebase-admin';
import { UserPayload } from 'src/shared/interfaces/user-payload.interface';

@Injectable()
export class FirebaseService {
  private app: admin.app.App;

  constructor() {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log(process.env.FIREBASE_SERVICE_ACCOUNT);
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT is not set in your environment',
      );
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (admin.apps.length === 0) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      this.app = admin.app();
    }
  }

  async verifyIdToken(idToken: string, checkRevoked = false) {
    try {
      return await this.app.auth().verifyIdToken(idToken, checkRevoked);
    } catch (error) {
      throw new Error('Invalid Firebase ID token');
    }
  }

  async deleteUser(uid: string) {
    await this.app.auth().deleteUser(uid);
  }

  async setCustomClaims(uid: string, userId: bigint, role: UserRole) {
    await this.app
      .auth()
      .setCustomUserClaims(uid, { userId: userId.toString(), role });
  }

  async getUser(uid: string) {
    return await this.app.auth().getUser(uid);
  }
  async createCustomToken(
    firebaseId: string,
    userId: bigint,
    role: UserRole,
  ): Promise<string> {
    const claims = { userId: userId.toString(), role };
    return await this.app.auth().createCustomToken(firebaseId, claims);
  }

  async generateForgetPassword(email: string) {
    try {
      const link = await this.app.auth().generatePasswordResetLink(email);
      return link;
    } catch (error) {
      if (error.code == 'auth/internal-error') {
        console.log('foire');

        throw new Error('Email not found in firebase');
      }
      throw error;
    }
  }

  async isUserExists(email: string): Promise<boolean> {
    try {
      await admin.auth().getUserByEmail(email);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return false;
      } else {
        throw error;
      }
    }
  }
}

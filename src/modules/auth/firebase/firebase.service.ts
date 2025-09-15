import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
@Injectable()
export class FirebaseService {
  private app: admin.app.App;

  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(
        path.resolve(__dirname, '../config/firebase-service-account.json'),
      ),
    });
  }

  async verifyToken(idToken: string) {
    const decoded = await this.app.auth().verifyIdToken(idToken);
    return decoded;
  }
}

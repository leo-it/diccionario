import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    if (!projectId) {
      throw new Error('Falta FIREBASE_PROJECT_ID en apps/api/.env');
    }

    this.app = admin.apps.length
      ? admin.app()
      : admin.initializeApp({ projectId });

    const emulator = this.config.get<string>('FIRESTORE_EMULATOR_HOST');
    console.log(
      `Firebase Admin listo (project=${projectId}, emulator=${emulator ?? 'off'})`,
    );
  }

  firestore() {
    return this.app.firestore();
  }

  auth() {
    return this.app.auth();
  }
}
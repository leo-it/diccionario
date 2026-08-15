import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    if (!projectId) {
      throw new Error('Falta FIREBASE_PROJECT_ID en apps/api/.env');
    }

    this.app =
      getApps().length > 0 ? getApp() : initializeApp({ projectId });

    const emulator = this.config.get<string>('FIRESTORE_EMULATOR_HOST');
    console.log(
      `Firebase Admin listo (project=${projectId}, emulator=${emulator ?? 'off'})`,
    );
  }

  firestore(): Firestore {
    return getFirestore(this.app);
  }

  auth(): Auth {
    return getAuth(this.app);
  }
}

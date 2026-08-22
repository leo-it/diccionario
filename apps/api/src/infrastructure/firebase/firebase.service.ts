import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  App,
  cert,
  getApp,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    if (!projectId) {
      throw new Error('Falta FIREBASE_PROJECT_ID');
    }

    if (getApps().length > 0) {
      this.app = getApp();
    } else {
      this.app = initializeApp(this.buildOptions(projectId));
    }

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

  private buildOptions(projectId: string) {
    const emulator = this.config.get<string>('FIRESTORE_EMULATOR_HOST');
    if (emulator) {
      return { projectId };
    }

    const raw = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT');
    if (!raw) {
      throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
    }

    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(raw) as ServiceAccount;
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT inválido');
    }

    return {
      projectId,
      credential: cert(serviceAccount),
    };
  }
}

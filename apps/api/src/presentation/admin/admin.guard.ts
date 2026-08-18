import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../infrastructure/firebase/firebase.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { uid: string; email?: string };
    }>();

    const header = request.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de admin');
    }

    let uid: string;
    let email: string | undefined;

    try {
      const decoded = await this.firebase.auth().verifyIdToken(token);
      uid = decoded.uid;
      email = decoded.email;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    const adminDoc = await this.firebase
      .firestore()
      .collection('admins')
      .doc(uid)
      .get();

    if (!adminDoc.exists) {
      throw new ForbiddenException('No sos admin');
    }

    request.user = { uid, email };
    return true;
  }
}

import { Injectable } from '@nestjs/common';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Dictionary } from '../../domain/dictionary/dictionary.entity';
import { type DictionaryRepository } from '../../domain/dictionary/dictionary.repository';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirestoreDictionaryRepository implements DictionaryRepository {
  constructor(private readonly firebase: FirebaseService) {}

  async findPublished(): Promise<Dictionary[]> {
    const snapshot = await this.firebase
      .firestore()
      .collection('dictionaries')
      .where('published', '==', true)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc));
  }

  async findPublishedBySlug(slug: string): Promise<Dictionary | null> {
    const snapshot = await this.firebase
      .firestore()
      .collection('dictionaries')
      .where('slug', '==', slug)
      .where('published', '==', true)
      .limit(1)
      .get();
    const doc = snapshot.docs[0];
    return doc ? this.toEntity(doc) : null;
  }
  

  private toEntity(doc: QueryDocumentSnapshot<DocumentData>): Dictionary {
    const data = doc.data();
    return {
      id: doc.id,
      title: String(data.title ?? ''),
      slug: String(data.slug ?? ''),
      description: String(data.description ?? ''),
      coverImageUrl: data.coverImageUrl
        ? String(data.coverImageUrl)
        : undefined,
      published: Boolean(data.published),
      createdAt: String(data.createdAt ?? ''),
      updatedAt: String(data.updatedAt ?? ''),
      createdBy: data.createdBy ? String(data.createdBy) : undefined,
    };
  }
}

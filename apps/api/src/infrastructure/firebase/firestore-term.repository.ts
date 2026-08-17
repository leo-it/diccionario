import { Injectable } from '@nestjs/common';
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Term } from '../../domain/term/term.entity';
import { type TermRepository } from '../../domain/term/term.repository';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirestoreTermRepository implements TermRepository {
  constructor(private readonly firebase: FirebaseService) {}

  async findPublishedByDictionaryId(dictionaryId: string): Promise<Term[]> {
    const snapshot = await this.firebase
      .firestore()
      .collection('dictionaries')
      .doc(dictionaryId)
      .collection('terms')
      .where('published', '==', true)
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc, dictionaryId));
  }

  async findPublishedByDictionaryIdAndSlug(
    dictionaryId: string,
    slug: string,
  ): Promise<Term | null> {
    const snapshot = await this.firebase
      .firestore()
      .collection('dictionaries')
      .doc(dictionaryId)
      .collection('terms')
      .where('published', '==', true)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    return doc ? this.toEntity(doc, dictionaryId) : null;
  }

  private toEntity(
    doc: QueryDocumentSnapshot<DocumentData>,
    dictionaryId: string,
  ): Term {
    const data = doc.data();
    return {
      id: doc.id,
      dictionaryId,
      lemma: String(data.lemma ?? ''),
      slug: String(data.slug ?? ''),
      definition: String(data.definition ?? ''),
      videoUrl: data.videoUrl ? String(data.videoUrl) : undefined,
      published: Boolean(data.published),
      createdAt: String(data.createdAt ?? ''),
      updatedAt: String(data.updatedAt ?? ''),
    };
  }
}

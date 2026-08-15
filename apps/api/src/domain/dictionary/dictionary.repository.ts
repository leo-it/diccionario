import { Dictionary } from './dictionary.entity';

/** Token de Nest para inyectar el puerto, no la clase de Firestore. */
export const DICTIONARY_REPOSITORY = Symbol('DICTIONARY_REPOSITORY');

export interface DictionaryRepository {
  findPublished(): Promise<Dictionary[]>;
}

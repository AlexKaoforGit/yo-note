import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Tag {
  id?: string;
  name: string;
  userId: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  getTags(userId: string): Observable<Tag[]> {
    const tagsRef = collection(this.firestore, 'tags');
    const q = query(tagsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Tag[]>;
  }

  addTag(tag: Tag) {
    const tagsRef = collection(this.firestore, 'tags');
    return addDoc(tagsRef, tag);
  }

  deleteTag(id: string) {
    const tagDoc = doc(this.firestore, 'tags', id);
    return deleteDoc(tagDoc);
  }
}

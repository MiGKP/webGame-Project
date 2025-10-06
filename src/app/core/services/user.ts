import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // BehaviorSubject จะคอยเก็บและแจ้งเตือนข้อมูลล่าสุดของผู้ใช้
  currentUser$ = new BehaviorSubject<any>(null);

  constructor() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        // ถ้ามี user ให้ไปดึงข้อมูลจาก Firestore
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          this.currentUser$.next(docSnap.data()); // ส่งข้อมูลล่าสุดให้ผู้ติดตาม
        }
      } else {
        // ถ้าไม่มี (logout) ให้ส่งค่า null
        this.currentUser$.next(null);
      }
    });
  }
}
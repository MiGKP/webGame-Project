import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth: Auth = inject(Auth);
  const firestore: Firestore = inject(Firestore);
  const router: Router = inject(Router);

  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists() && userDocSnap.data()['role'] === 'admin') {
      return true; // เป็น Admin ไปต่อได้
    }
  }
  
  router.navigate(['/shop']); // ไม่ใช่ Admin กลับไปหน้าร้านค้า
  return false;
};
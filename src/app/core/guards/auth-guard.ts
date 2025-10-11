import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth: Auth = inject(Auth);
  const router: Router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, user => {
      if (user) {
        resolve(true); // ล็อกอินแล้ว ไปต่อได้
      } else {
        router.navigate(['/login']); // ยังไม่ล็อกอิน กลับไปหน้า login
        resolve(false);
      }
    });
  });
};
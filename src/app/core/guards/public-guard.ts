import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const auth: Auth = inject(Auth);
  const router: Router = inject(Router);

  // authState คือตัวที่คอย "ฟัง" สถานะล่าสุดจาก Firebase
  return authState(auth).pipe(
    take(1), // ให้รอฟังแค่ "คำตอบแรก" ที่ Firebase ส่งมา แล้วหยุดฟัง
    map(user => {
      // หลังจากได้คำตอบแล้ว
      if (user) {
        // ถ้าคำตอบคือ "มี user ล็อกอินอยู่"
        // ให้เปลี่ยนเส้นทางไปหน้า shop และไม่อนุญาตให้เข้าหน้านี้ (login/register)
        router.navigate(['/shop']);
        return false;
      }
      // ถ้าคำตอบคือ "ไม่มี user ล็อกอิน"
      // ก็อนุญาตให้เข้าหน้านี้ได้ตามปกติ
      return true;
    })
  );
};
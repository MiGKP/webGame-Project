import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, RouterLink ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';

  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private firestore: Firestore = inject(Firestore);

  async onLogin() {
    if (!this.email || !this.password) {
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      if (user) {
        // 1. สร้าง Reference ไปยังเอกสารของผู้ใช้
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        
        // 2. ดึงข้อมูลเอกสาร
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // 3. เช็คค่า 'role' แล้วส่งไปหน้าที่ถูกต้อง
          if (userData['role'] === 'admin') {
            this.router.navigate(['/admin']); // ถ้าเป็น Admin ไปหน้า admin
          } else {
            this.router.navigate(['/shop']); // ถ้าเป็น User ไปหน้า shop
          }
        } else {
          alert('ไม่พบข้อมูลผู้ใช้ในระบบ');
          this.auth.signOut();
        }
      }
    } catch (error: any) {
      console.error(error.code, error.message);
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  }
}
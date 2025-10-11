import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false; // สำหรับควบคุม Animation

  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private firestore: Firestore = inject(Firestore);

  async onLogin() {
    if (!this.email || !this.password) {
      alert('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    this.isLoading = true; // เริ่ม Animation

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData['role'] === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/shop']);
          }
        } else {
          alert('ไม่พบข้อมูลผู้ใช้ในระบบ');
          this.auth.signOut();
          this.isLoading = false; // หยุด Animation ถ้าเกิดข้อผิดพลาด
        }
      }
    } catch (error: any) {
      console.error(error.code, error.message);
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      this.isLoading = false; // หยุด Animation ถ้าเกิดข้อผิดพลาด
    }
  }
}
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterLink ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  // Form data
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';

  // File upload
  selectedFile: File | null = null;
  profileImagePreview: string | ArrayBuffer | null = null;

  // Inject Firebase services
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private router: Router = inject(Router);

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.profileImagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // ในไฟล์ src/app/pages/register/register.component.ts

async onRegister() {
  // --- Validation Checks ---
  if (!this.displayName || !this.email || !this.password || !this.selectedFile) {
    alert('กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบถ้วน');
    return;
  }
  
  if (this.password !== this.confirmPassword) {
    alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!');
    return;
  }

  try {
    // 1. สร้าง User ใน Authentication
    const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
    const user = userCredential.user;

    // 2. อัปโหลดรูปภาพไปที่ Storage
    const storageRef = ref(this.storage, `profile-pictures/${user.uid}/profile.jpg`);
    const uploadResult = await uploadBytes(storageRef, this.selectedFile);
    const photoURL = await getDownloadURL(uploadResult.ref);

    // 3. บันทึกข้อมูลเพิ่มเติมลง Firestore
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: this.email,
      displayName: this.displayName,
      photoURL: photoURL,
      role: 'user'
    });

    alert('สมัครสมาชิกสำเร็จ!');
    this.router.navigate(['/login']);

  } catch (error: any) {
    console.error(error);
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  }
}
}
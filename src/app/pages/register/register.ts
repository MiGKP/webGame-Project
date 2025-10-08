import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterLink ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  // Form data
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false; // <-- เพิ่มตัวแปรนี้

  // File upload
  selectedFile: File | null = null;
  profileImagePreview: string | ArrayBuffer | null = null;

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

  async onRegister() {
    if (!this.displayName || !this.email || !this.password || !this.selectedFile) {
      alert('กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบถ้วน');
      return;
    }
    if (this.password !== this.confirmPassword) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!');
      return;
    }

    this.isLoading = true; // <-- เริ่ม Animation

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      const storageRef = ref(this.storage, `profile-pictures/${user.uid}/profile.jpg`);
      const uploadResult = await uploadBytes(storageRef, this.selectedFile);
      const photoURL = await getDownloadURL(uploadResult.ref);

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: this.email,
        displayName: this.displayName,
        photoURL: photoURL,
        role: 'user',
        walletBalance: 0 // เพิ่มค่าเริ่มต้นให้ Wallet
      });

      alert('สมัครสมาชิกสำเร็จ!');
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error(error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      this.isLoading = false; // <-- หยุด Animation เสมอไม่ว่าจะสำเร็จหรือล้มเหลว
    }
  }
}
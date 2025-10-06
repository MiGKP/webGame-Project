import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../layout/navbar/navbar';

// Firebase Imports
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  // Inject Firebase Services
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  user: any = null; // สำหรับเก็บข้อมูลผู้ใช้ที่ล็อกอินอยู่
  selectedFile: File | null = null;
  profileImagePreview: string | ArrayBuffer | null = null;
  isLoading = true;

  ngOnInit(): void {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.fetchUserData(currentUser.uid);
    }
  }

  async fetchUserData(uid: string) {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      this.user = { uid: docSnap.id, ...docSnap.data() };
      this.profileImagePreview = this.user.photoURL; // ตั้งค่ารูปพรีวิวเริ่มต้น
    } else {
      console.error("User data not found!");
    }
    this.isLoading = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // สร้างพรีวิวรูปภาพใหม่ทันที
      const reader = new FileReader();
      reader.onload = e => this.profileImagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  async onUpdateProfile() {
    if (!this.user) return;

    this.isLoading = true;
    const userDocRef = doc(this.firestore, `users/${this.user.uid}`);
    let photoURL = this.user.photoURL;

    try {
      // 1. ถ้ามีการเลือกไฟล์รูปใหม่ ให้อัปโหลดก่อน
      if (this.selectedFile) {
        const storageRef = ref(this.storage, `profile-pictures/${this.user.uid}/profile.jpg`);
        await uploadBytes(storageRef, this.selectedFile);
        photoURL = await getDownloadURL(storageRef);
      }

      // 2. เตรียมข้อมูลที่จะอัปเดต
      const dataToUpdate = {
        displayName: this.user.displayName,
        photoURL: photoURL
      };

      // 3. อัปเดตข้อมูลใน Firestore
      await updateDoc(userDocRef, dataToUpdate);

      alert('Profile updated successfully!');
      this.selectedFile = null; // รีเซ็ตไฟล์ที่เลือก
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert('Failed to update profile.');
    } finally {
      this.isLoading = false;
    }
  }
}
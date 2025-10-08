import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { UserService } from '../../core/services/user';

// Firebase Imports
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, orderBy, query } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { collectionData } from 'rxfire/firestore';
import { User } from '../../core/interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  userService: UserService = inject(UserService);

  user: User | null = null;
  selectedFile: File | null = null;
  profileImagePreview: string | ArrayBuffer | null = null;
  isLoading = true;
  customAmount: number | null = null;

  transactions$: Observable<any[]> | undefined;

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.user = { ...user };
        this.profileImagePreview = user.photoURL;
        this.isLoading = false;
        this.loadTransactions(user.uid);
      } else {
        this.user = null;
        this.isLoading = false;
      }
    });
  }

  loadTransactions(uid: string): void {
    const transactionsCollectionRef = collection(this.firestore, `users/${uid}/transactions`);
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
    this.transactions$ = collectionData(q, { idField: 'id' });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
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
      if (this.selectedFile) {
        const storageRef = ref(this.storage, `profile-pictures/${this.user.uid}/profile.jpg`);
        await uploadBytes(storageRef, this.selectedFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const dataToUpdate = {
        displayName: this.user.displayName,
        photoURL: photoURL
      };

      await updateDoc(userDocRef, dataToUpdate);
      this.userService.currentUser$.next({ ...this.user, ...dataToUpdate });

      alert('Profile updated successfully!');
      this.selectedFile = null;
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert('Failed to update profile.');
    } finally {
      this.isLoading = false;
    }
  }

  async topUpWallet(amount: number) {
    if (!this.user || !this.user.uid) {
      alert('กรุณาล็อกอินเพื่อทำรายการ');
      return;
    }
    if (amount <= 0) {
      alert('จำนวนเงินต้องมากกว่า 0');
      return;
    }

    this.isLoading = true;
    const userDocRef = doc(this.firestore, `users/${this.user.uid}`);
    
    try {
      const newBalance = (this.user.walletBalance || 0) + amount;
      await updateDoc(userDocRef, { walletBalance: newBalance });

      const transactionsCollectionRef = collection(this.firestore, `users/${this.user.uid}/transactions`);
      await addDoc(transactionsCollectionRef, {
        date: serverTimestamp(),
        type: 'Top-up',
        amount: amount,
        description: `Top-up ${amount} THB`
      });

      this.user.walletBalance = newBalance;
      this.userService.currentUser$.next(this.user);
      this.customAmount = null;
      alert(`เติมเงิน ${amount} บาท สำเร็จ! ยอดเงินคงเหลือ: ${newBalance} บาท`);
    } catch (error) {
      console.error("Error topping up wallet: ", error);
      alert('เกิดข้อผิดพลาดในการเติมเงิน');
    } finally {
      this.isLoading = false;
    }
  }

  onCustomTopUp() {
    if (this.customAmount && this.customAmount > 0) {
      this.topUpWallet(this.customAmount);
    } else {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
    }
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { Firestore, collection, getDocs, query, collectionData, orderBy } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Interface for User data
interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  walletBalance: number;
  role: 'user' | 'admin'; // <--- เพิ่ม property นี้
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  searchTerm: string = '';

  // State for modal
  selectedUser: User | null = null;
  transactions$: Observable<any[]> | null = null;

  ngOnInit(): void {
    this.fetchAllUsersData();
  }

  async fetchAllUsersData() {
    this.isLoading = true;
    try {
      const usersCollectionRef = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(query(usersCollectionRef));
      
      this.allUsers = usersSnapshot.docs
        .map(doc => doc.data() as User)
        .filter(user => user.role !== 'admin'); // <--- เพิ่มการกรองตรงนี้

      this.filteredUsers = this.allUsers;

    } catch (error) {
      console.error("Error fetching users data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredUsers = this.allUsers;
      return;
    }
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.displayName.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.email.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  viewHistory(user: User): void {
    this.selectedUser = user;
    const transactionsCollectionRef = collection(this.firestore, `users/${user.uid}/transactions`);
    const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
    this.transactions$ = collectionData(q, { idField: 'id' });
  }

  closeModal(): void {
    this.selectedUser = null;
    this.transactions$ = null;
  }
}
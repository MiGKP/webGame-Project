import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { GameCardComponent } from '../../components/game-card/game-card';
import { UserService } from '../../core/services/user';

// Firebase Imports
import { Firestore, collection, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../../core/interfaces/user.interface';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, GameCardComponent],
  templateUrl: './library.html',
  styleUrls: ['./library.scss']
})
export class LibraryComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);

  ownedGames: any[] = []; // เก็บข้อมูลเกมทั้งหมดที่ผู้ใช้เป็นเจ้าของ
  isLoading = true;

  ngOnInit(): void {
    // ติดตามข้อมูลผู้ใช้จาก UserService
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.fetchOwnedGames(user.uid);
      } else {
        // Handle case where user logs out while on this page
        this.isLoading = false;
        this.ownedGames = [];
      }
    });
  }

  async fetchOwnedGames(uid: string) {
    this.isLoading = true;
    try {
      // 1. ดึง "รายการ" ID เกมที่ผู้ใช้เป็นเจ้าของ (จาก Subcollection)
      const ownedGamesRef = collection(this.firestore, `users/${uid}/owned_games`);
      const ownedGamesSnapshot = await getDocs(ownedGamesRef);
      const gameIds = ownedGamesSnapshot.docs.map(d => d.id);

      if (gameIds.length === 0) {
        this.ownedGames = [];
        this.isLoading = false;
        return;
      }

      // 2. ใช้ ID ที่ได้ไปดึง "รายละเอียด" ของแต่ละเกม (จาก Collection 'games')
      const gamePromises = gameIds.map(gameId => {
        const gameDocRef = doc(this.firestore, `games/${gameId}`);
        return getDoc(gameDocRef);
      });
      
      const gameDocs = await Promise.all(gamePromises);

      // 3. ประกอบร่างข้อมูล
      this.ownedGames = gameDocs
        .filter(doc => doc.exists()) // กรองเอาเฉพาะเกมที่ยังมีอยู่ในร้านค้า
        .map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
      console.error("Error fetching owned games:", error);
    } finally {
      this.isLoading = false;
    }
  }
}

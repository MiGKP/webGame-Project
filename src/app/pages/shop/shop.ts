import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. Import FormsModule
import { Firestore, collection, getDocs, query, orderBy, limit } from '@angular/fire/firestore';
import { GameCardComponent } from '../../components/game-card/game-card';
import { NavbarComponent } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, // 2. เพิ่ม FormsModule ที่นี่
    GameCardComponent, 
    NavbarComponent
  ],
  templateUrl: './shop.html',
  styleUrls: ['./shop.scss']
})
export class ShopComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  
  allGames: any[] = []; // เก็บเกมทั้งหมดที่ดึงมาครั้งแรก
  filteredGames: any[] = []; // เก็บเกมที่จะแสดงผล (หลังจากการกรอง)
  rankedGames: any[] = [];
  searchTerm: string = ''; // 3. เพิ่มตัวแปรสำหรับเก็บคำค้นหา

  ngOnInit(): void {
    this.fetchGames();
  }

  async fetchGames() {
    const gamesCollection = collection(this.firestore, 'games');
    // ดึงเกมทั้งหมด
    const gamesSnapshot = await getDocs(gamesCollection);
    this.allGames = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    this.filteredGames = this.allGames; // 4. ตอนเริ่มต้นให้แสดงเกมทั้งหมด

    // ดึงเกมตามอันดับ
    const rankedQuery = query(gamesCollection, orderBy('salesCount', 'desc'), limit(5));
    const rankedSnapshot = await getDocs(rankedQuery);
    this.rankedGames = rankedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 5. เพิ่มฟังก์ชันสำหรับการค้นหา
  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredGames = this.allGames; // ถ้าช่องค้นหาว่าง ให้แสดงเกมทั้งหมด
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    
    this.filteredGames = this.allGames.filter(game => 
      game.name.toLowerCase().includes(lowerCaseSearchTerm) || 
      game.category.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}
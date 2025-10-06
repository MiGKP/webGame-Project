import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameCardComponent } from '../../components/game-card/game-card';
import { Navbar } from '../../layout/navbar/navbar';
import { Firestore, collection, getDocs, query, orderBy, limit } from '@angular/fire/firestore';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    GameCardComponent,
    Navbar
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class ShopComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  allGames: any[] = [];
  rankedGames: any[] = [];

  ngOnInit(): void {
    this.fetchGames();
  }

  async fetchGames() {
    const gamesCollection = collection(this.firestore, 'games');
    // ดึงเกมทั้งหมด
    const gamesSnapshot = await getDocs(gamesCollection);
    this.allGames = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // ดึงเกมตามอันดับ
    const rankedQuery = query(gamesCollection, orderBy('salesCount', 'desc'), limit(5));
    const rankedSnapshot = await getDocs(rankedQuery);
    this.rankedGames = rankedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
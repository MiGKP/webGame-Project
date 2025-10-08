import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar';

// Firebase Imports
import { Firestore, collection, getDocs, query, orderBy, limit } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  
  // สำหรับการ์ดสรุปยอด
  stats = {
    totalRevenue: 0,
    totalSales: 0,
    totalUsers: 0,
    totalGames: 0
  };

  // สำหรับตาราง
  topSellingGames: any[] = [];
  recentlyAddedGames: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.fetchAllDashboardData();
  }

  async fetchAllDashboardData() {
    this.isLoading = true;
    try {
      // ดึงข้อมูลทั้งหมดพร้อมกันเพื่อความรวดเร็ว
      await Promise.all([
        this.fetchStats(),
        this.fetchTopSellingGames(),
        this.fetchRecentlyAddedGames()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchStats() {
    // ดึงข้อมูล User
    const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
    this.stats.totalUsers = usersSnapshot.size;

    // ดึงข้อมูล Game
    const gamesSnapshot = await getDocs(collection(this.firestore, 'games'));
    this.stats.totalGames = gamesSnapshot.size;
    
    let totalRevenue = 0;
    let totalSales = 0;
    gamesSnapshot.forEach(doc => {
      const game = doc.data();
      totalSales += game['salesCount'] || 0;
      totalRevenue += (game['salesCount'] || 0) * (game['price'] || 0);
    });
    this.stats.totalRevenue = totalRevenue;
    this.stats.totalSales = totalSales;
  }

  async fetchTopSellingGames() {
    const gamesCollection = collection(this.firestore, 'games');
    const q = query(gamesCollection, orderBy('salesCount', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    this.topSellingGames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async fetchRecentlyAddedGames() {
    const gamesCollection = collection(this.firestore, 'games');
    const q = query(gamesCollection, orderBy('releaseDate', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    this.recentlyAddedGames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
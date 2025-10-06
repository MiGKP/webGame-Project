import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Import Navbar เข้ามาใช้
import { Navbar } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule, Navbar,RouterModule],
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.scss']
})
export class GameDetailsComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private firestore: Firestore = inject(Firestore);

  game: any; // ตัวแปรสำหรับเก็บข้อมูลเกมที่ดึงมาได้

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.fetchGameDetails(gameId); // <--- เปิดใช้งาน
    }
  }

  async fetchGameDetails(id: string) {
    const gameDocRef = doc(this.firestore, 'games', id);
    const docSnap = await getDoc(gameDocRef);
    if (docSnap.exists()) {
      this.game = { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
    }
  }
}
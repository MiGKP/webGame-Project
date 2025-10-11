import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { Firestore, collection, getDocs, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';

interface Game {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  releaseDate: any; // Using 'any' for simplicity with Firestore Timestamps
}

@Component({
  selector: 'app-all-games',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './all-game.html',
  styleUrls: ['./all-game.scss']
})
export class AllGamesComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  
  games: Game[] = [];
  isLoading = true;

  // For Edit Modal
  isEditModalOpen = false;
  currentGame: Game | null = null;

  ngOnInit(): void {
    this.fetchAllGames();
  }

  async fetchAllGames() {
    this.isLoading = true;
    try {
      const gamesCollectionRef = collection(this.firestore, 'games');
      const gamesSnapshot = await getDocs(gamesCollectionRef);
      this.games = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      this.isLoading = false;
    }
  }

  openEditModal(game: Game) {
    // Create a copy to avoid modifying the original object directly
    this.currentGame = { ...game };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.currentGame = null;
  }

  async onUpdateGame() {
    if (!this.currentGame) return;

    const gameDocRef = doc(this.firestore, `games/${this.currentGame.id}`);
    try {
      await updateDoc(gameDocRef, {
        name: this.currentGame.name,
        category: this.currentGame.category,
        description: this.currentGame.description,
        price: this.currentGame.price,
      });
      // Update the local array to reflect changes immediately
      const index = this.games.findIndex(g => g.id === this.currentGame!.id);
      if (index > -1) {
        this.games[index] = { ...this.currentGame };
      }
      this.closeEditModal();
    } catch (error) {
      console.error("Error updating game: ", error);
    }
  }

  async onDeleteGame(gameId: string) {
    if (confirm('Are you sure you want to delete this game?')) {
      const gameDocRef = doc(this.firestore, `games/${gameId}`);
      try {
        await deleteDoc(gameDocRef);
        this.games = this.games.filter(g => g.id !== gameId);
      } catch (error) {
        console.error("Error deleting game: ", error);
      }
    }
  }
}
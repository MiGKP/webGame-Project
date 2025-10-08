import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { NavbarComponent } from '../../../layout/navbar/navbar';
import { FormsModule } from '@angular/forms';
// ... imports อื่นๆ ที่จำเป็น

@Component({ selector: 'app-manage-games',
  imports: [NavbarComponent,FormsModule],
  templateUrl: './manage-games.html',
  styleUrl: './manage-games.scss' })
export class ManageGamesComponent {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  game: any = { name: '', description: '', price: null, category: '' };
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async onAddGame() {
    if (!this.selectedFile) {
      alert('Please select a game image.');
      return;
    }
    try {
      // 1. Upload Image to Storage
      const filePath = `game-images/${Date.now()}_${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadResult = await uploadBytes(storageRef, this.selectedFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // 2. Prepare Game Data
      const gameData = {
        ...this.game,
        imageUrl: imageUrl,
        releaseDate: Timestamp.now(), // วันที่วางขายอัตโนมัติ [cite: 41]
        salesCount: 0 
      };

      // 3. Add Document to Firestore
      const gamesCollection = collection(this.firestore, 'games');
      await addDoc(gamesCollection, gameData);

      alert('Game added successfully!');
      // TODO: clear form
      
    } catch (error) {
      console.error("Error adding game: ", error);
      alert('Failed to add game.');
    }
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// --- แก้ไข Path และชื่อ Class ที่นี่ ---
import { NavbarComponent } from '../../layout/navbar/navbar';
import { UserService } from '../../core/services/user';
import { User } from '../../core/interfaces/user.interface';

// Firebase Imports
import { Firestore, doc, getDoc, runTransaction, collection, serverTimestamp } from '@angular/fire/firestore';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-game-details',
  standalone: true,
  // --- แก้ไขชื่อ Component ใน imports array ---
  imports: [CommonModule, NavbarComponent],
  // --- แก้ไขชื่อไฟล์ให้ถูกต้อง ---
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.scss']
})
export class GameDetailsComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  cartService: CartService = inject(CartService); // Inject CartService

  game: any;
  currentUser: User | null = null;
  ownsGame: boolean = false;
  isLoading: boolean = true;
  isPurchasing: boolean = false;
  isInCart: boolean = false;

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.fetchGameDetails(gameId);
    }

    this.cartService.cartItems$.subscribe(items => {
      if (this.game) {
        this.isInCart = items.some(item => item.id === this.game.id);
      }
    });

    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.game && this.currentUser) {
        this.checkOwnership();
      }
    });
  }

  async fetchGameDetails(id: string) {
    this.isLoading = true;
    const gameDocRef = doc(this.firestore, 'games', id);
    const docSnap = await getDoc(gameDocRef);

    if (docSnap.exists()) {
      this.game = { id: docSnap.id, ...docSnap.data() };
      if (this.currentUser) {
        this.checkOwnership();
      }
    } else {
      console.log("No such game!");
      this.router.navigate(['/shop']);
    }
    this.isLoading = false;
  }

  async checkOwnership() {
    if (!this.currentUser || !this.game) return;
    const ownershipRef = doc(this.firestore, `users/${this.currentUser.uid}/owned_games/${this.game.id}`);
    const docSnap = await getDoc(ownershipRef);
    this.ownsGame = docSnap.exists();
  }

  async purchaseGame() {
    if (!this.currentUser || !this.game || this.ownsGame || this.isPurchasing) return;
    
    const userBalance = this.currentUser.walletBalance || 0;
    if (userBalance < this.game.price) {
      alert('Your balance is not enough to purchase this game.');
      return;
    }

    if (!confirm(`Confirm purchase of "${this.game.name}" for ฿${this.game.price}?`)) {
      return;
    }
    
    this.isPurchasing = true;
    const userRef = doc(this.firestore, "users", this.currentUser.uid);

    try {
      await runTransaction(this.firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "User document does not exist!";
        }

        const userData = userDoc.data() as User;
        const currentBalance = userData.walletBalance || 0;

        if (currentBalance < this.game.price) {
          throw "Insufficient funds!";
        }
        
        const newBalance = currentBalance - this.game.price;
        
        transaction.update(userRef, { walletBalance: newBalance });

        const ownedGameRef = doc(this.firestore, `users/${this.currentUser!.uid}/owned_games/${this.game.id}`);
        transaction.set(ownedGameRef, { purchaseDate: serverTimestamp() });

        const transactionRef = doc(collection(this.firestore, `users/${this.currentUser!.uid}/transactions`));
        transaction.set(transactionRef, {
          date: serverTimestamp(),
          type: 'Purchase',
          amount: this.game.price,
          description: `Purchased: ${this.game.name}`
        });
      });

      alert('Purchase successful! The game has been added to your library.');
      this.ownsGame = true;
      const updatedUser = { ...this.currentUser, walletBalance: (this.currentUser.walletBalance || 0) - this.game.price };
      this.userService.currentUser$.next(updatedUser as User);

    } catch (e) {
      console.error("Transaction failed: ", e);
      alert("Purchase failed. Please try again.");
    } finally {
      this.isPurchasing = false;
    }
  }

  addToCart() {
    if (!this.game || this.ownsGame || this.isInCart) return;
    this.cartService.addToCart(this.game);
  }
}
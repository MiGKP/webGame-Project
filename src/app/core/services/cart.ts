import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { Firestore, runTransaction, doc, collection, serverTimestamp, writeBatch, increment } from '@angular/fire/firestore'; // 1. Import increment
import { UserService } from './user';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private firestore: Firestore = inject(Firestore);
  private userService: UserService = inject(UserService);

  private cartItemsSource = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSource.asObservable();

  // ... (addToCart, removeFromCart, etc.) ...
  addToCart(game: any) {
    const currentItems = this.cartItemsSource.getValue();
    if (!currentItems.find(item => item.id === game.id)) {
      this.cartItemsSource.next([...currentItems, game]);
      alert(`"${game.name}" has been added to your cart.`);
    }
  }

  removeFromCart(gameId: string) {
    const currentItems = this.cartItemsSource.getValue();
    this.cartItemsSource.next(currentItems.filter(item => item.id !== gameId));
  }

  clearCart() {
    this.cartItemsSource.next([]);
  }

  getCartItems() {
    return this.cartItemsSource.getValue();
  }

  async checkout(currentUser: User, gamesToPurchase: any[], totalPrice: number) {
    if (gamesToPurchase.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const userRef = doc(this.firestore, "users", currentUser.uid);

    await runTransaction(this.firestore, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User document does not exist!";
      }

      const userData = userDoc.data() as User;
      const currentBalance = userData.walletBalance || 0;

      if (currentBalance < totalPrice) {
        throw `Insufficient funds! You need ฿${totalPrice}, but you only have ฿${currentBalance}.`;
      }

      const newBalance = currentBalance - totalPrice;
      transaction.update(userRef, { walletBalance: newBalance });

      // --- ส่วนที่แก้ไข ---
      gamesToPurchase.forEach(game => {
        // 2. อัปเดต salesCount ของเกมแต่ละเกมที่ซื้อ
        const gameRef = doc(this.firestore, "games", game.id);
        transaction.update(gameRef, { salesCount: increment(1) }); // +1 salesCount

        // เพิ่มเกมเข้าคลัง (owned_games)
        const ownedGameRef = doc(this.firestore, `users/${currentUser.uid}/owned_games/${game.id}`);
        transaction.set(ownedGameRef, { purchaseDate: serverTimestamp() });

        // สร้างประวัติการซื้อ (transactions)
        const transactionRef = doc(collection(this.firestore, `users/${currentUser.uid}/transactions`));
        transaction.set(transactionRef, {
          date: serverTimestamp(),
          type: 'Purchase',
          amount: game.price,
          description: `Purchased: ${game.name}`
        });
      });
    });

    const updatedUser = { ...currentUser, walletBalance: (currentUser.walletBalance || 0) - totalPrice };
    this.userService.currentUser$.next(updatedUser as User);
    this.clearCart();
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar';
import { CartService } from '../../core/services/cart';
import { UserService } from '../../core/services/user';
import { User } from '../../core/interfaces/user.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent], // Add FormsModule
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {
  cartService: CartService = inject(CartService);
  userService: UserService = inject(UserService);
  router: Router = inject(Router);

  cartItems$: Observable<any[]> | undefined;
  totalPrice$: Observable<number> | undefined;
  currentUser: User | null = null;
  isCheckingOut = false;

  discountCode: string = ''; // สำหรับช่องกรอกโค้ด

  ngOnInit(): void {
    this.cartItems$ = this.cartService.cartItems$;
    this.totalPrice$ = this.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.price, 0))
    );
    this.userService.currentUser$.subscribe(user => this.currentUser = user);
  }

  removeFromCart(gameId: string) {
    this.cartService.removeFromCart(gameId);
  }

  applyDiscount() {
    // TODO: Implement discount logic in the future
    alert(`Discount code "${this.discountCode}" applied! (Functionality not yet implemented)`);
  }

  async onCheckout() {
    if (!this.currentUser) {
      alert("Please log in to proceed.");
      return;
    }
    this.isCheckingOut = true;
    const items = this.cartService.getCartItems();
    const total = items.reduce((sum, item) => sum + item.price, 0);

    try {
      await this.cartService.checkout(this.currentUser, items, total);
      alert('Checkout successful! Your games have been added to your library.');
      this.router.navigate(['/library']);
    } catch (error: any) {
      console.error("Checkout failed:", error);
      alert(`Checkout failed: ${error.message || error}`);
    } finally {
      this.isCheckingOut = false;
    }
  }
}


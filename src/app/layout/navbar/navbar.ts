import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import { UserService } from '../../core/services/user'; // แก้ไข Path
import { CartService } from '../../core/services/cart'; // Import CartService
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html', // แก้ไขชื่อไฟล์
  styleUrls: ['./navbar.scss'] // แก้ไขชื่อไฟล์
})
export class NavbarComponent implements OnInit { // แก้ไขชื่อ Class และเพิ่ม implements OnInit
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  userService = inject(UserService);
  cartService = inject(CartService); // Inject CartService

  isDropdownOpen = false;
  cartItemCount$: Observable<number> | undefined;

  ngOnInit(): void {
    // เพิ่มส่วนนี้เพื่อติดตามจำนวนสินค้าในตะกร้า
    this.cartItemCount$ = this.cartService.cartItems$.pipe(
      map(items => items.length)
    );
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  }
}
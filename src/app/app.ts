import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>', // ให้มีแค่ router-outlet
})
export class AppComponent {
  // แค่ inject เข้ามาเฉยๆ constructor ของ service จะทำงานอัตโนมัติ
  private userService = inject(UserService); 
}
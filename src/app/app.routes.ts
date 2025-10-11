import { Routes } from '@angular/router';
// --- Import Guards เข้ามาใช้งาน ---
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { publicGuard } from './core/guards/public-guard';

export const routes: Routes = [
    // --- หน้าสำหรับคนที่ยังไม่ล็อกอิน ---
    {
        path: 'login',
        canActivate: [publicGuard],
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        canActivate: [publicGuard],
        loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
    },

    // --- หน้าสำหรับผู้ใช้ที่ล็อกอินแล้ว ---
    {
        path: 'shop',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/shop/shop').then(m => m.ShopComponent)
    },
    {
        path: 'library',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/library/library').then(m => m.LibraryComponent)
    },
    {
    path: 'cart',
    canActivate: [authGuard], // ต้องล็อกอินก่อน
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent)
},
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
    },
    {
        path: 'game/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/game-details/game-details').then(m => m.GameDetailsComponent)
    },

    // --- หน้าสำหรับ Admin เท่านั้น (โครงสร้างใหม่) ---
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          { 
            path: '', // หน้า /admin หลัก ให้ไปที่ dashboard
            loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent) 
          },
          { 
            path: 'manage-games', // หน้าสำหรับจัดการเกมโดยเฉพาะ
            loadComponent: () => import('./pages/admin/manage-games/manage-games').then(m => m.ManageGamesComponent) 
          },
          { // เพิ่มส่วนนี้เข้าไป
            path: 'users',
            loadComponent: () => import('./pages/admin/users/users').then(m => m.UsersComponent)
          },
           { // เพิ่มส่วนนี้เข้าไป
            path: 'all-game',
            loadComponent: () => import('./pages/admin/all-game/all-game').then(m => m.AllGamesComponent)
          }
        ]
    },
    
    // --- การจัดการเส้นทางพื้นฐาน ---
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];
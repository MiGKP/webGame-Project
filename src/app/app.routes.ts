import { Routes } from '@angular/router';
// --- Import Guards เข้ามาใช้งาน ---
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { publicGuard } from './core/guards/public-guard';

export const routes: Routes = [
    // --- หน้าสำหรับคนที่ยังไม่ล็อกอิน ---
    {
        path: 'login',
        canActivate: [publicGuard], // 2. เพิ่ม Guard ที่นี่
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        canActivate: [publicGuard], // 3. เพิ่ม Guard ที่นี่ด้วย
        loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
    },

    // --- หน้าสำหรับผู้ใช้ที่ล็อกอินแล้ว ---
    {
        path: 'shop',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/shop/shop').then(m => m.ShopComponent)
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

    // --- หน้าสำหรับ Admin เท่านั้น ---
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('./pages/admin/manage-games/manage-games').then(m => m.ManageGamesComponent)
    },
    
    // --- การจัดการเส้นทางพื้นฐาน ---
    {
        path: '', // ถ้าเข้ามาที่เว็บเฉยๆ ให้ไปหน้า login
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: '**', // ถ้าหา path ไหนไม่เจอเลย
        redirectTo: '/login',
        pathMatch: 'full'
    }
];
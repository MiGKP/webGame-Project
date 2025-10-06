export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  walletBalance?: number; // '?' หมายถึง property นี้อาจจะไม่มีก็ได้
}
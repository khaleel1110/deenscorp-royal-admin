import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  getUserRole(): string {
    // You can implement your logic here to fetch user role from backend or local storage
    return 'admin'; // Example role
  }
}

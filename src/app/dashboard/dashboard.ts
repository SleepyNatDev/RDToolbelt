import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication-service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [
    MatButtonModule,
    MatLabel
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  loggedIn: Observable<boolean>;
  constructor(private authService: AuthenticationService, private router: Router) {
    this.loggedIn = this.authService.isLoggedIn;
  }

  logout() {
    this.authService.logout();
  }
}

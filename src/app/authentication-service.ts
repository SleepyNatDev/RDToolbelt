import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private refreshTimer?: any;
    private refreshMilli: number = 60 * 60 * 1000; // 1 hour
    private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private initialized: BehaviorSubject<boolean> = new BehaviorSubject(false);

    get isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    get isInitialized() {
        return this.initialized.asObservable();
    }

    constructor(private http: HttpClient, private router: Router) {
        this.getState().subscribe((loginState) => {
            switch(loginState.state) {
                case LoginStateId.LoggedIn:
                    this.loggedIn.next(true);
                    this.scheduleRefresh();
                    this.initialized.next(true);
                    this.initialized.complete();
                    break;
                case LoginStateId.Refresh:
                    this.refreshAccessToken().subscribe({
                        next: () => {
                            this.loggedIn.next(true);
                            this.scheduleRefresh();
                            this.initialized.next(true);
                            this.initialized.complete();
                        },
                        error: () => {
                            this.initialized.next(true);
                            this.initialized.complete();
                        }
                    });
                    break;
                case LoginStateId.LoggedOut:
                    this.initialized.next(true);
                    this.initialized.complete();
                    break;
            }
        });
        
    }

    login(fd: FormData) {
        this.http.post('/api/auth/login/', fd, { withCredentials: true }).subscribe({
            next: () => {
                this.loggedIn.next(true);
                this.scheduleRefresh();
                this.router.navigate(['']);
            },
            error: () => {
                this.loggedIn.next(false);
            }
        });
    }

    logout() {
        this.http.get('/api/auth/logout/', { withCredentials: true }).subscribe(() => {
            this.loggedIn.next(false);
            this.router.navigate(['']);
        });
    }

    private scheduleRefresh() {
        clearTimeout(this.refreshTimer);
        const refreshTime = this.refreshMilli - (60 * 1000);
        this.refreshTimer = setTimeout(() => {
            this.refreshAccessToken().subscribe(() => {
                this.scheduleRefresh();
            });
        }, refreshTime);
    }

    private refreshAccessToken() {
        return this.http.get('/api/auth/refresh', { withCredentials: true });
    }

    private getState() {
        return this.http.get<LoginState>('/api/auth/state', { withCredentials: true });
    }
}

export interface LoginState {
    state: LoginStateId;
}

export enum LoginStateId {
    'LoggedIn' = 1,
    'Refresh' = 2,
    'LoggedOut' = 3
}
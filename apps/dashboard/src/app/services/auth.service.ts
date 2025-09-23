import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { UserDto } from '@task-management/data';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';
    private tokenKey = 'access_token';

    private http = inject(HttpClient);

    login(username: string, password: string) {
        return this.http.post<{ message: string; user: any }>(
            `${this.apiUrl}/login`,
            { username, password },
            { withCredentials: true }  // 👈 send/receive cookies
        );
    }

    logout() {
        return this.http.post(
            `${this.apiUrl}/logout`,
            {},
            { withCredentials: true }
        );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getMe() {
        return this.http.get<UserDto>(
            `${this.apiUrl}/me`,
            { withCredentials: true }
        );
    }
}

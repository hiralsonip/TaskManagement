import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from "@task-management/data"

@Injectable({ providedIn: 'root' })
export class UserStateService {
    private userSubject = new BehaviorSubject<UserDto | null>(null);
    user$ = this.userSubject.asObservable();

    setUser(user: UserDto) {
        this.userSubject.next(user);
    }

    clearUser() {
        this.userSubject.next(null);
    }

    get currentUser(): UserDto | null {
        return this.userSubject.value;
    }
}

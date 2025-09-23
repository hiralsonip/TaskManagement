import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { UserStateService } from "../../state/user-state.service";
import { UserDto } from "@task-management/data";


@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
})

export class LoginComponent {
    private fb = inject(FormBuilder)
    private authService = inject(AuthService)
    private router = inject(Router)
    private userState = inject(UserStateService)

    loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    onSubmit() {
        if (this.loginForm.valid) {
            const { username, password } = this.loginForm.value;
            this.authService.login(username!, password!).subscribe({
                next: (res: { user: UserDto }) => {
                    this.userState.setUser(res.user)
                    this.router.navigate(['/dashboard'])
                },
                error: (err) => {
                    alert(err.error.message || 'Login failed')
                }
            })
        }
    }
}
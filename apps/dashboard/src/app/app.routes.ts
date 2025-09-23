import { Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';

export const appRoutes: Route[] = [
    { path: "", component: DashboardComponent },
    { path: "dashboard", component: DashboardComponent },
    { path: "login", component: LoginComponent }
];

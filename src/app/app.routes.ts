import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ColaboradoresComponent } from './colaboradores/colaboradores.component';
import { UsuarioComponent } from './usuario/usuario.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'usuario', component: UsuarioComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirigir a /login por defecto
    { path: '**', redirectTo: '/login' }
];

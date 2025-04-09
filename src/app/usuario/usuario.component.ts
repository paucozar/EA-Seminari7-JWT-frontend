import { CommonModule } from '@angular/common';
import { Component, inject, EventEmitter, Output } from '@angular/core';
import { User } from '../models/user.model';
import { ColaboradoresComponent } from "../colaboradores/colaboradores.component";
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ColaboradoresComponent, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
  standalone: true
})
export class UsuarioComponent {
  foto: string;
  mostrardata: boolean;
  isLoading: boolean = true;
  
  usuario: User = {
    id: 1,
    name: "Toni",
    age: 40,
    email: "toni.oller@gmail.com",
    password: "12345678",
    role: "admin",
    refreshToken: "1234567890abcdefg"
  };
  
  constructor() {      
    this.foto = "https://github.com/tonioller.png";
    this.mostrardata = false;

    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  mostrardatos(){
    this.mostrardata = true;
  }

  getName(Name: string){
    this.usuario.name = Name;
  }

}

import { Injectable, inject, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private http: HttpClient) { }

  private apiUrl = "http://localhost:9000/api/users";

  getUsers(): Observable<User[]> {
/**
 
    let token = localStorage.getItem('access_token');
    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: 'Bearer' + localStorage.getItem('access_token')
    })
      ... get(apiURL, {headers: httpHeaders})
    */
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {

    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<User>('getUser')) // Retorna un observable vacío en caso de error
    );
  }

  // Método genérico para manejar errores
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T); // Devuelve un valor predeterminado o vacío
    };
  }
}

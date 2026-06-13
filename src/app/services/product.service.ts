import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product, ProductCategory } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly url = 'assets/data/products.json';
  private cache: Product[] | null = null;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    if (this.cache) return of(this.cache);
    return this.http.get<Product[]>(this.url).pipe(
      tap(data => this.cache = data),
    );
  }

  getByCategory(category: ProductCategory | 'all'): Observable<Product[]> {
    return this.getProducts().pipe(
      map(list => category === 'all' ? list : list.filter(p => p.category === category)),
    );
  }

  getById(id: number): Observable<Product | null> {
    return this.getProducts().pipe(
      map(list => list.find(p => p.id === id) ?? null),
    );
  }

  search(query: string): Observable<Product[]> {
    const q = query.toLowerCase();
    return this.getProducts().pipe(
      map(list => list.filter(p => p.name.toLowerCase().includes(q))),
    );
  }
}

import { Injectable } from '@angular/core';
import { Recipe } from './recipe';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
    constructor(private http: HttpClient) { }

    getRecipes() {
        return this.http.get<Recipe[]>('/api/recipes');
    }

    addRecipe(recipe: Recipe) {
        return this.http.post('/api/recipes/add', recipe);
    }

    getRecipe(id: string) {
        return this.http.get<Recipe>('/api/recipes/' + id);
    }
}

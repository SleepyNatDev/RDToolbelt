import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatLabel } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from '../recipe';
import { RecipeService } from '../recipe-service';
import { MatChipsModule } from '@angular/material/chips';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  imports: [
    MatLabel,
    MatCardModule,
    MatChipsModule,
    CommonModule
  ],
  selector: 'app-recipe-view',
  styleUrl: './recipe-view.scss',
  templateUrl: './recipe-view.html',
})
export class RecipeView {
  recipe: BehaviorSubject<Recipe> = new BehaviorSubject<Recipe>({
    id: 0,
    name: '',
    image: '',
    description: '',
    tags: []
  });

  get currRecipe() {
    return this.recipe.asObservable();
  }

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router) {
    let id = this.route.snapshot.paramMap.get('id')??'';
    this.recipeService.getRecipe(id).subscribe({
      next: (retRecipe) => {
        this.recipe.next(retRecipe);
      }, error: (err) => {
        router.navigate(['recipes']);
      }
    });
  }
}

import { Routes } from '@angular/router';
import { Main } from './main/main';
import { BmiCalc } from './bmi-calc/bmi-calc';
import { ExchangesCalc } from './exchanges-calc/exchanges-calc';
import { MealPlans } from './meal-plans/meal-plans';
import { Recipes } from './recipes/recipes';
import { MsjCalc } from './msj-calc/msj-calc';
import { Login } from './login/login';
import { anonymousGuard } from './anonymous-guard';
import { authGuard } from './auth-guard';
import { Dashboard } from './dashboard/dashboard';
import { RecipeView } from './recipe-view/recipe-view';
import { FourOhFour } from './four-oh-four/four-oh-four';

export const routes: Routes = [
    {
        path: '',
        component: Main,
        title: 'RDToolbelt Home',
    },
    {
        path: 'login',
        component: Login,
        title: 'Login - RDToolbelt',
        canActivate: [anonymousGuard],
    },
    {
        path: 'dashboard',
        component: Dashboard,
        title: 'Dashboard - RDToolbelt',
        canActivate: [authGuard],
    },
    {
        path: 'bmi-calc',
        component: BmiCalc,
        title: 'BMI Calculator - RDToolbelt',
    },
    {
        path: 'exchanges-calc',
        component: ExchangesCalc,
        title: 'Exchanges Calculator - RDToolbelt',
    },
    {
        path: 'meal-plans',
        component: MealPlans,
        title: 'Meal Plans - RDToolbelt',
    },
    {
        path: 'recipes',
        component: Recipes,
        title: 'Recipes - RDToolbelt'
    },
    {
        path: 'recipes/:id',
        component: RecipeView,
        title: 'test'
    },
    {
        path: 'msj-calc',
        component: MsjCalc,
        title: 'Mifflin-St Jeor Calculator - RDToolbelt',
    },
    {
        path: '404',
        component: FourOhFour,
        title: 'Page Not Found - RDToolbelt'
    },
    {
        path: '**',
        redirectTo: '404'
    }
];

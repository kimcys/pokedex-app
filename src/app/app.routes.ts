import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PokemonDetailPageComponent } from './pages/pokemon-detail-page/pokemon-detail-page.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'pokemon/:name', component: PokemonDetailPageComponent },
    { path: 'pokemon/id/:id', component: PokemonDetailPageComponent },
    { path: '**', redirectTo: '' } 
];

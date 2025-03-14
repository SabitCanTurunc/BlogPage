import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'post/:id', component: PostDetailComponent },
    { path: 'create-post', component: CreatePostComponent },
    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: '' }
];

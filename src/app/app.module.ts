import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { AllPostsComponent } from "./all-posts/all-posts.component";
import { FollowingComponent } from "./following/following.component";
import { FavoritesComponent } from "./favorites/favorites.component";
import { MyPostsComponent } from "./my-posts/my-posts.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { HomeComponent } from "./home/home.component";
import { AppRoutingModule } from "./app-routing.module";
import { LoginComponent } from "./auth/login/login.component";
import { FormsModule } from "@angular/forms";
import { RouteGuard } from "./auth/route-guard";
import { NotificationComponent } from "./notification/notification.component";
import { NotificationService } from "./shared/notification.service";
import { FirebaseService } from "./shared/firebase.service";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AllPostsComponent,
    FollowingComponent,
    FavoritesComponent,
    MyPostsComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    LoginComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [RouteGuard, NotificationService, FirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }

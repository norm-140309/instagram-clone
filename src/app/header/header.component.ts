import { Component, OnInit } from "@angular/core";
import * as firebase from "firebase";
import { UserService } from "../shared/user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  user: any;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {

    this.userService.statusChange.subscribe( userData => {
      if ( userData ) {
        this.user = userData;
      } else {
        this.user = null;
      }
    });

    firebase.auth().onAuthStateChanged(userData => {
      if (userData && userData.emailVerified) {
        this.isLoggedIn = true;
        this.user = this.userService.getProfile();
        this.router.navigate([ "/allposts" ]);
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  onLogout () {
    firebase.auth().signOut()
      .then ( () => {
        this.userService.destroy();
        this.isLoggedIn = false;
      });
  }

}

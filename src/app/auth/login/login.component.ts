import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import * as firebase from "firebase";
import { NotificationService } from "../../shared/notification.service";
import { FirebaseService } from "../../shared/firebase.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {

  constructor( private notifier: NotificationService, private firebaseservice: FirebaseService ) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then ( userData => {
        if ( userData.emailVerified ) {
          return this.firebaseservice.getUserFromDatabase( userData.uid );
        } else {
          const message = "Please check your inbox, as your email address has not been verified.";
          this.notifier.display( "error", message, 5000 );
          firebase.auth().signOut();
        }
      })
      .then ( userDataFromDatabase => {
        if ( userDataFromDatabase ) {
          console.log( "userData:", userDataFromDatabase );
        }
      })
      .catch ( err => {
        this.notifier.display( "error", err.message, 5000 );
      });
  }

}

import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import * as firebase from "firebase";
import { NotificationService } from "../../shared/notification.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit {

  constructor( private notifier: NotificationService ) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    const fullname = form.value.fullname;
    const email = form.value.email;
    const password = form.value.password;

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then( userData => { 
        userData.sendEmailVerification();
        return firebase.database().ref("users/" + userData.uid).set({
          email: email,
          uid: userData.uid,
          registrationDate: new Date().toString(),
          name: fullname
        })
        .then( () => {
          firebase.auth().signOut();
        })
        .then ( () => {
          this.notifier.display( "success", "Thank you for creating an account! You can now log in." );
        });
      })
      .catch( err => {
        this.notifier.display( "error", err.message );
      });
  }

}

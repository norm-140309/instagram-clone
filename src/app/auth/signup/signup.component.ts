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
        const message = `A verification email has been sent to ${email}.
                          Please check your inbox and click the verification link.
                          Once verification is complete, please login to the application.`;
        this.notifier.display( "success", message, 7000 );
        return firebase.database().ref("users/" + userData.uid).set({
          email: email,
          uid: userData.uid,
          registrationDate: new Date().toString(),
          name: fullname
        })
        .then( () => {
          firebase.auth().signOut();
        });
      })
      .catch( err => {
        this.notifier.display( "error", err.message, 3000 );
      });
  }

}

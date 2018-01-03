import { Component, OnInit } from "@angular/core";
import * as firebase from "firebase";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "app";

  ngOnInit() {
    const config = {
      apiKey: "AIzaSyArMZvQdDCp5yEOQwg2oe4ep5D6XXmpBVs",
      authDomain: "instaclone-554c3.firebaseapp.com",
      databaseURL: "https://instaclone-554c3.firebaseio.com",
      projectId: "instaclone-554c3",
      storageBucket: "instaclone-554c3.appspot.com",
      messagingSenderId: "334003957971"
    };
    firebase.initializeApp(config);
  }
}

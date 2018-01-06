import * as firebase from "firebase";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FirebaseService } from "../shared/firebase.service";
import { NotificationService } from "../shared/notification.service";

@Component({
  selector: "app-my-posts",
  templateUrl: "./my-posts.component.html",
  styleUrls: ["./my-posts.component.css"]
})
export class MyPostsComponent implements OnInit, OnDestroy {
  postList: any[] = [];
  personalPostsRef: any;

  constructor(
    private firebaseservice: FirebaseService,
    private notifier: NotificationService
  ) { }

  ngOnInit() {
    const uid = firebase.auth().currentUser.uid;
    this.personalPostsRef = this.firebaseservice.getUserPostsRef(uid);
    // Initially loads all posts under user's uid
    this.personalPostsRef.on("child_added", data => {
      this.postList.push({
        key: data.key,
        data: data.val()
      });
    });
  }

  onFileSelection ( event ) {
    const fileList: FileList = event.target.files;

    if ( fileList.length > 0 ) {
      const file: File = fileList[0];
      this.firebaseservice.uploadFile( file )
        .then ( data => {
          const message = "Your picture uploaded successfully.";
          this.notifier.display( "success", message, 3000 );
          console.log("my-posts data:", data);
          this.firebaseservice.handleImageUpload( data );
        })
        .catch ( err => {
          this.notifier.display( "error", err, 3000 );
        });
    }
  }

  ngOnDestroy() {
    this.personalPostsRef.off();
  }
}

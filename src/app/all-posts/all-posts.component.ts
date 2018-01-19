import { NotificationService } from "./../shared/notification.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import * as firebase from "firebase";
import * as _ from "lodash";
import { FirebaseService } from "../shared/firebase.service";

@Component({
  selector: "app-all-posts",
  templateUrl: "./all-posts.component.html",
  styleUrls: ["./all-posts.component.css"]
})
export class AllPostsComponent implements OnInit, OnDestroy {
  all: any = [];
  allRef: any;
  loadMoreRef: any;
  perPage = 10;
  constructor(
    private firebaseservice: FirebaseService,
    private notifier: NotificationService
  ) { }

  ngOnInit() {
    this.allRef = firebase.database().ref("allposts").limitToFirst(this.perPage);
    this.allRef.on("child_added", data => {
      this.all.push({
        key: data.key,
        data: data.val()
      });
    });
  }

  onLoadMore() {
    if (this.all.length > 0) {
      // const lastLoadedPost = this.all[this.all.length - 1];
      const lastLoadedPost = _.last(this.all);
      const lastLoadedPostKey = lastLoadedPost.key;
      this.loadMoreRef =  firebase.database().ref("allposts")
                                  .startAt(null, lastLoadedPostKey)
                                  .limitToFirst(this.perPage + 1);
      this.loadMoreRef.on("child_added", data => {
        if (data.key === lastLoadedPostKey) {
          return;
        } else {
          this.all.push({
            key: data.key,
            data: data.val()
          });
        }
      });
    }
  }

  onFavoritesClicked(imgData) {
    this.firebaseservice.handleFavoriteClicked(imgData)
      .then( data => {
        const message = "Image added to favorites.";
        this.notifier.display( "success", message, 3000 );
      })
      .catch( err => {
        const message = "Error adding image to favorites.";
        this.notifier.display( "error", message, 3000 );
      });
  }

  onFollowClicked(imgData) {
    this.firebaseservice.followUser(imgData.uploadedBy)
      .then( data => {
        const message = "You are now following " + imgData.uploadedBy.name + ".";
        this.notifier.display( "success", message, 3000 );
      })
      .catch( err => {
        const message = "Error following user.";
        this.notifier.display( "error", message, 3000 );
      });
  }

  ngOnDestroy() {
    this.allRef.off();
    if (this.loadMoreRef) {
      this.loadMoreRef.off();
    }
  }

}

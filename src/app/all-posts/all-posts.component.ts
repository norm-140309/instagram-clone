import { Component, OnInit, OnDestroy } from "@angular/core";
import * as firebase from "firebase";
import * as _ from "lodash";

@Component({
  selector: "app-all-posts",
  templateUrl: "./all-posts.component.html",
  styleUrls: ["./all-posts.component.css"]
})
export class AllPostsComponent implements OnInit, OnDestroy {
  all: any = [];
  allRef: any;
  loadMoreRef: any;
  perPage = 3;
  constructor() { }

  ngOnInit() {
    this.allRef = firebase.database().ref("allposts").limitToFirst(3);
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
                                  .limitToFirst(3 + 1);
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

  onFavoritesClicked(event) {

  }

  onFollowClicked(event) {

  }

  ngOnDestroy() {
    this.allRef.off();
    if (this.loadMoreRef) {
      this.loadMoreRef.off();
    }
  }

}

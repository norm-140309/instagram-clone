import { UserService } from "./user.service";
import * as firebase from "firebase";
import { Injectable } from "@angular/core";

@Injectable()
export class FirebaseService {
  constructor( private user: UserService ) {}

  getUserFromDatabase(uid) {
    const ref = firebase.database().ref( "users/" + uid );
    return ref.once( "value" )
      .then ( snapshot => snapshot.val() );
  }

  generateRandomName(ext) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 16; i++) {
      text += possible.charAt(Math.random() * possible.length);
    }
    return text; // + "." + ext;
  }

  uploadFile( file ) {
    const origName = file.name;
    let ext = origName.split(".")[1];
    if (ext.length !== 3) { ext = "jpg"; }
    const filename = this.generateRandomName(ext);
    // const fileRef = firebase.storage().ref().child("image/" + filename);
    const fileRef = firebase.storage().ref().child(filename);
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
      uploadTask.on( "state_changed", snapshot => {
        // upload percentage, etc...
      }, error => {
        reject( error );
      }, () => {
        const fileType = uploadTask.snapshot.metadata.contentType;
        const fileUrl = uploadTask.snapshot.downloadURL;
        resolve( { "filename": filename, "fileUrl": fileUrl, "fileType": fileType } );
      });
    });
  }

  handleImageUpload(data) {
    const user = this.user.getProfile();
    const newPersonalPostKey = firebase.database().ref().child("myposts").push().key;

    const personalPostDetails = {
      fileUrl: data.fileUrl,
      name: data.filename,
      creationDate: new Date().toString()
    };

    const allPostKey = firebase.database().ref("allposts").push().key;
    const allPostDetails = {
      fileUrl: data.fileUrl,
      name: data.filename,
      creationDate: new Date().toString(),
      uploadedBy: user
    };

    const imageDetails = {
      fileUrl: data.fileUrl,
      name: data.filename,
      creationDate: new Date().toString(),
      uploadedBy: user,
      favoriteCount: 0
    };

    const updates = {};
    updates[ "/myposts/" + user.uid + "/" + newPersonalPostKey ] = personalPostDetails;
    updates[ "/allposts/" + allPostKey ] = allPostDetails;
    updates[ "/images/" + data.filename ] = imageDetails;

    return firebase.database().ref().update(updates);
  }

  getUserPostsRef(uid) {
    return firebase.database().ref("myposts").child(uid);
  }

  handleFavoriteClicked(imgData) {
    const uid = firebase.auth().currentUser.uid;
    const updates = {};

    updates[ "/images/" + imgData.name + "/oldFavoriteCount" ] = imgData.favoriteCount;
    updates[ "/images/" + imgData.name + "/favoriteCount" ] = imgData.favoriteCount + 1;
    updates[ "/favorites/" + uid + "/" + imgData.name ] = imgData;

    return firebase.database().ref().update(updates);
  }

  followUser(userData) {
    const uid = firebase.auth().currentUser.uid;
    const updates = {};

    updates[ "/follow/" + uid + "/" + userData.uid ] = true;

    return firebase.database().ref().update(updates);
  }

  getKeyByName(name) {
    return new Promise( (resolve, reject) => {
      const allRef = firebase.database().ref().child("allposts");
      allRef.orderByChild("name").equalTo(name).on("value", function(snapshot) {
        let myKey = "";
        // tslint:disable-next-line:forin
        for (const i in snapshot.val()) { myKey = i; }
        resolve (myKey);
        // resolve (Object.keys(snapshot.val())[0]);
      });
    });
  }

  deleteImage(imgData, key) {
    this.getKeyByName(imgData.name)
      .then( (allKey) => {
        console.log("via Promise... allKey:", allKey);
        firebase.database().ref().update({ ["/allposts/" + allKey]: null });
      });

    // const allRef = firebase.database().ref().child("allposts");
    // allRef.orderByChild("name").equalTo(imgData.name).on("value", function(snapshot) {
    //   let myKey = "";
    //   // tslint:disable-next-line:forin
    //   for (const i in snapshot.val()) {
    //     myKey = i;
    //   }
    //   firebase.database().ref().update({ ["/allposts/" + myKey]: null });
    // });

    const uid = firebase.auth().currentUser.uid;
    const updates = {};
    updates[ "/images/" + imgData.name ] = null;
    updates[ "/myposts/" + uid + "/" + key ] = null;
    // updates[ "/favorites/" + uid + "/" + imgData.name ] = imgData;
    return firebase.database().ref().update(updates);
  }

}

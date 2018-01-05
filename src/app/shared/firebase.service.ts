import * as firebase from "firebase";

export class FirebaseService {

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
    return text + "." + ext;
  }

  uploadFile( file ) {
    const origName = file.name;
    let ext = origName.split(".")[1];
    if (ext.length != 3) { ext = "jpg" }
    const filename = this.generateRandomName(ext);
    const fileRef = firebase.storage().ref().child("image/" + filename);
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
}

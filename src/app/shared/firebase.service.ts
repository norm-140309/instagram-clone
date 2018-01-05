import * as firebase from "firebase";

export class FirebaseService {

  getUserFromDatabase(uid) {
    const ref = firebase.database().ref( "users/" + uid );
    return ref.once( "value" )
      .then ( snapshot => snapshot.val() );
  }
}

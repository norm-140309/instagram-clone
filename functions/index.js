const functions = require('firebase-functions');
const SlackWebhook = require("slack-webhook");
const slack = new SlackWebhook("https://hooks.slack.com/services/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");
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;

exports.generateThumbnail = functions.storage.object()
  .onChange(event => {
    const object = event.data;
    const filePath = object.name;
    const fileName = filePath.split("/").pop();
    const fileBucket = object.bucket;
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = `/tmp/${fileName}`;

    if (fileName.startsWith("thumb_")) {
      console.log("Already a thumbnail");
      return;
    }

    if (!object.contentType.startsWith("image/")) {
      console.log("This is not an image.");
      return;
    }
    if (object.resourceState === "not_exists") {
      console.log("This is a deletion event.");
      return;
    }
    return bucket.file(filePath).download({
      destination: tempFilePath
    })
    .then (() => {
      console.log("image downloaded locally to", tempFilePath);
      return spawn("convert", [tempFilePath, "-thumbnail", "200x200>",
        tempFilePath])
    })
    .then (() => {
      console.log("thumbnail created");
      // match end of string that contains a slash followed by 0 or more characters that are not a slash:
      const thumbFilePath = filePath.replace(/(\/)?([^\/]*)*/, '$1thumb_$2');

      return bucket.upload(tempFilePath, {
        destination: thumbFilePath
      });
    })
  })

exports.addToFollowing = functions.database.ref("/follow/{initiatorUid}/{interestedInFollowingUid}")
  .onCreate( event => {
    const initiatorUid = event.params.initiatorUid;
    const interestedInFollowingUid = event.params.interestedInFollowingUid;
    const rootRef = event.data.ref.root;
    let FollowingMeRef = rootRef.child("usersFollowingMe/" + interestedInFollowingUid + "/" + initiatorUid);
    return FollowingMeRef.set(true);
  });

exports.notifyOfNewUser = functions.database.ref("/users/{userId}")
  .onCreate( event => {
    const newUser = event.data.val();
    const msg = `
Date: ${newUser.registrationDate} 
Username: ${newUser.name} 
Email: ${newUser.email} 
UID: ${newUser.uid} 
    `;
    return slack.send( msg )
      .then(function (res) {
        console.log({ status: "success", msg: "Slack message sent successfully." }); 
      }).catch(function (err) {
        console.log({ status: "error", msg: err }); 
      });
  });
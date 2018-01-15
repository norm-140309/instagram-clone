const functions = require("firebase-functions");
const SlackWebhook = require("slack-webhook");
const slack = new SlackWebhook("https://hooks.slack.com/services/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");
const gcs = require("@google-cloud/storage")({keyFilename: "instaclone-554c3-firebase-adminsdk-487ti-2ac5708996.json"});
const spawn = require("child-process-promise").spawn;
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

exports.generateThumbnail = functions.storage.object()
  .onChange(event => {
    const object = event.data;
    const filePath = object.name;
    const fileName = filePath.split("/").pop();
    const fileBucket = object.bucket;
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = `/tmp/${fileName}`;
    const ref = admin.database().ref();
    const file = bucket.file(filePath);
    const thumbFilePath = filePath.replace(/(\/)?([^\/]*)*/, "$1thumb_$2");

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
      return bucket.upload(tempFilePath, {
        destination: thumbFilePath
      });
    })
    .then (() => {
      const thumbFile =bucket.file(thumbFilePath);
      const config = {
        action: "read",
        expires: "01-01-2038"
      }
      return Promise.all([
        thumbFile.getSignedUrl(config),
        file.getSignedUrl(config)
      ]);
    })
    .then(results => {
      const thumbResult = results[0];
      const originalResult = results[1];
      const thumbFileUrl = thumbResult[0];
      const fileUrl = originalResult[0];
      return ref.child("images/" + fileName + "/thumbUrl").set(thumbFileUrl);
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
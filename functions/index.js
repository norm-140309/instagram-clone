const functions = require('firebase-functions');
const SlackWebhook = require("slack-webhook");
const slack = new SlackWebhook("https://hooks.slack.com/services/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");

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
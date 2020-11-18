const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { HttpsError } = require('firebase-functions/lib/providers/https');

admin.initializeApp();

exports.sendPush = functions.https.onCall(async (data, context) => {
    let senderId = context.auth.uid;
    let text = data.text;
    let usersId = Object.keys(data.users_id);
    let senderName = data.sender_name;
    let usersDict = data.users_id;
    let roomId = data.room_id;
    let pushType = data.push_type;
    let fcmToken = data.fcm_token;
    functions.logger.info(`all fields exist: ${senderId} 
    ${text} ${usersId} ${senderName} ${usersDict} ${roomId} ${pushType} ${fcmToken}`, {structuredData: true});
    let userId = usersId[0];
    let badges = usersDict[userId];
    let date = new Date();
    if (badges !== undefined && fcmToken !== undefined) {
        let payload = {
            notification: {
                title: senderName.toString(),
                body: text.toString(),
                sound: 'default',
                badge: badges.toString()
            },
            data: {
                notification_type: pushType.toString(),
                sender_uid: senderId,
                chat_room_uid: roomId,
                timestamp_epoch: date.getTime().toString()
            }
        };
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
        functions.logger.info(`PAYLOAD ${payload}`);
        return admin.messaging().sendToDevice(fcmToken, payload, options).then(response => {
            functions.logger.info(`RESULTS ${response.results}`);
        });
    } else {
        functions.logger.info('badges or token is UNDEFINED');
    }
});
exports.sendGroupPush = functions.https.onCall(async (data, context) => {
    let senderId = context.auth.uid;
    let text = data.text;
    let usersId = Object.keys(data.users_id);
    let senderName = data.sender_name;
    let usersDict = data.users_id;
    let roomId = data.room_id;
    let roomName = data.room_name;
    let pushType = data.push_type;
    let fcmTokens = data.fcm_tokens;
    functions.logger.info(`all fields exist: ${senderId} 
    ${text} ${usersId} ${senderName} ${usersDict} ${roomId} ${pushType} ${fcmTokens}`, {structuredData: true});
    usersId.forEach(userId => {
        let badges = usersDict[userId];
        let token = fcmTokens[userId];
        let date = new Date();
        let body = senderName.toString() + ": " + text.toString();
        if (badges !== undefined && token !== undefined) {
            let payload = {
                notification: {
                    title: roomName.toString(),
                    body: body,
                    sound: 'default',
                    badge: badges.toString()
                },
                data: {
                    notification_type: pushType.toString(),
                    sender_uid: senderId,
                    chat_room_uid: roomId,
                    timestamp_epoch: date.getTime().toString()
                }
            };
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            };
            functions.logger.info(`PAYLOAD ${payload}`);
            return admin.messaging().sendToDevice(token, payload, options).then(response => {
                functions.logger.info(`RESULTS ${response.results}`);
            });
        } else {
            functions.logger.info('badges or token is UNDEFINED');
        }
    });
});
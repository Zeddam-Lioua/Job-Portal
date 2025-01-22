const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const APP_ID = "0191d05e615549beb20676f14e80b476";
const APP_CERTIFICATE = "c28e9798286c4f03861e9205261f359e";
const CHANNEL_NAME = "test";
const UID = 0; // Set to 0 for dynamic UID
const ROLE = RtcRole.PUBLISHER;
const EXPIRE_TIME = 3600; // Token expiration time in seconds

const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpireTime = currentTimestamp + EXPIRE_TIME;

const token = RtcTokenBuilder.buildTokenWithUid(
  APP_ID,
  APP_CERTIFICATE,
  CHANNEL_NAME,
  UID,
  ROLE,
  privilegeExpireTime
);

console.log("Token:", token);

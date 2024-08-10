const express = require("express");
const router = express.Router();
const {streamAllPackets,resendPacket} = require("../controller/clientController");


router.get("/stream-all-packets",streamAllPackets);
router.get("/resend-packet",resendPacket);


module.exports = router;
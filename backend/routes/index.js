const express = require("express");
const router = express.Router();
const userRouter = require("./user");

router.get("/user", userRouter);

module.exports = router;

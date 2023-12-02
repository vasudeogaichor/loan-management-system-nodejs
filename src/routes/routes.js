const express = require("express");
const router = express.Router();

const { registerController } = require("../controllers");

const {validateRequest} = require("../middleware/validateRequest");

router.post("/register", validateRequest, registerController);

module.exports = router;

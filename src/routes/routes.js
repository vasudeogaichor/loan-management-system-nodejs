const express = require("express");
const router = express.Router();

const {
  registerController,
  eligibilityController,
  loanCreateController,
  loanViewController,
  paymentController,
  statementController,
} = require("../controllers");

const { validateRequest } = require("../middleware/validateRequest");

router.post("/register", validateRequest, registerController);
router.post("/check-eligibility", validateRequest, eligibilityController);
router.post("/create-loan", validateRequest, loanCreateController);
router.get("/view-loan/:loan_id", validateRequest, loanViewController);
router.post(
  "/make-payment/:customer_id/:loan_id",
  validateRequest,
  paymentController
);
router.get(
  "/view-statement/:customer_id/:loan_id",
  validateRequest,
  statementController
);

module.exports = router;

const extractUrlPath = (requestUrl) => {
  // TODO - generalize below blocks
  if ('/register'.includes(requestUrl)) {
    return 'register'
  }
  if ('/check-eligibility'.includes(requestUrl)) {
    return 'loan'
  }
  if ('/create-loan'.includes(requestUrl)) {
    return 'loan'
  }
  if ('/make-payment'.includes(requestUrl)) {
    return 'payment'
  }
};

const authenticateRequest = (req, res) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Missing Authorization header" });
  }

  const authHeader = req.headers.authorization;
  const [authType, authToken] = authHeader.split(" ");

  // Check if the Authorization header is in the expected format
  if (authType !== "Bearer" || !authToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid Authorization header format" });
  }

  // TODO - This is just a placeholder, to be replaced with actual logic like decoding a JWT and checking its validity
  if (authToken !== "valid_token") {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }

  // TODO - Add logged in user data with user info like user_id, permissions etc.
  req.user = { username: "exampleUser" };
};

const validateAndParsePayload = (payload, expectedFormat) => {
  const parsedPayload = {};
  for (const field in expectedFormat) {
    const { type } = expectedFormat[field];
    let value = payload[field];
    if (value) {
      switch (type.name) {
        case "Number":
          if (isNaN(value)) {
            res.status(400).json({
              error: `${field} type is incorrect: ${type.name} | value: ${value}`,
            });
          }
          parsedPayload[`${field}`] = parseInt(value, 10);
          break;
        case "String":
          value = String(value);
          if (value.trim().length) {
            parsedPayload[`${field}`] = value;
          }
          break;
        case "Date":
          parsedPayload[`${field}`] = value;
          break;
        default:
          res.status(400).json({
            error: `Unsupported ${field} type: ${type.name}`,
          });
          return null;
      }
    }
  }

  return parsedPayload;
};

const validateRequest = async (req, res, next) => {
  try {
    authenticateRequest(req, res);
    const apiService = extractUrlPath(req.url);

    if (apiService && Object.values(req.body).length) {
      const payloadFormat = require(`../apiformats/payloadFormats/${apiService}PayloadFormat`);
      req.body = validateAndParsePayload(req.body, payloadFormat);
    }

    next();
  } catch (e) {
    res.status(400).json(`Error: ${e}`);
  }
};

module.exports = { validateRequest };

const extractUrlPath = (requestUrl) => {
    const match = requestUrl.match(/^\/(\w+)/);
  
    if (match) {
      return match[1];
    }
  }

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

const validateRequest = async (req, res, next) => {
  try {
    console.log("url", req.url);
    authenticateRequest(req, res);
    const apiService = extractUrlPath(req.url);
    console.log('apiService- ', apiService)
    console.log("req.method - ", req.method)

    // TODO: Add payload and param parsing to make sure data types of fields are as defined
    // switch (req.method) {
    //     case "GET":
    //       const criteria = parseCrieria(apiService, req.query, res);
    //       req.query = criteria;
    //       break;
  
    //     case "POST":
    //       const parsedResourcePOST = parseResource(apiService, req.body, res);
    //       req.body = parsedResourcePOST;
    //       break;
  
    //     case "PUT":
    //       const parsedResourcePUT = parseResource(apiService, req.body, res);
    //       req.body = parsedResourcePUT;
    //       break;
  
    //     case "DELETE":
    //       break;
    //   }

  next();
  } catch (e) {
    res.status(400).json(`Error: ${e}`);
  }
};

module.exports = { validateRequest };
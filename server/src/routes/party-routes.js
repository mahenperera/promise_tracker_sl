// import express from "express";
// import jwtAuth from "../middlewares/jwt-auth.js";
// import requireRole from "../middlewares/require-role.js";

// import {
//   createPartyHandler,
//   deletePartyHandler,
//   getPartyBySlugHandler,
//   getPartyHandler,
//   listPartiesHandler,
//   updatePartyHandler,
//   getPartyPoliticiansBySlugHandler,
// } from "../controllers/party-controller.js";

// const router = express.Router();

// // Public
// router.get("/", jwtAuth.optional, listPartiesHandler);
// router.get("/slug/:slug", jwtAuth.optional, getPartyBySlugHandler);
// router.get(
//   "/slug/:slug/politicians",
//   jwtAuth.optional,
//   getPartyPoliticiansBySlugHandler,
// );
// router.get("/:id", jwtAuth.optional, getPartyHandler);

// // Admin
// router.post("/", jwtAuth, requireRole(["admin"]), createPartyHandler);
// router.patch("/:id", jwtAuth, requireRole(["admin"]), updatePartyHandler);
// router.delete("/:id", jwtAuth, requireRole(["admin"]), deletePartyHandler);

// export default router;

import express from "express";
import jwtAuth from "../middlewares/jwt-auth.js";
import {
  getPartyBySlugHandler,
  listPartiesHandler,
} from "../controllers/party-controller.js";

const router = express.Router();

// Public
router.get("/", jwtAuth.optional, listPartiesHandler);
router.get("/:slug", jwtAuth.optional, getPartyBySlugHandler);

export default router;

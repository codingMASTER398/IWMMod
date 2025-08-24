import express from "express";
import db from "./db";
import proxyThrough from "./proxyThrough";
import bodyParser from "body-parser";
import { jwtDecode } from "jwt-decode";

type userDataPayload = {
  username: String
}

const router = express.Router();

router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
    type: () => {
      return true;
    },
    limit: "15mb",
    parameterLimit: 15000,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

router.use(`/:password/api/v1`, async (req, res, next) => {
  if(req.params.password.length !== 11) {
    res.status(400).send(`Invalid password`)
    return;
  }

  const user = await db.getUserByAuth(req.params.password);
  const fixedURL = `/api` + req.originalUrl.split("/api")[1];

  if(user?.server) {
    await db.users.updateOne({
      password: req.params.password
    }, {
      $set: {
        lastRequest: Date.now()
      }
    })

    proxyThrough(req, res, fixedURL, user.server, true, user.mods);
    return;
  }

  // No user, do login flow
  switch (fixedURL) {
    case "/api/v1/mapcount":
      res.send(`1337`);
      return;
    case "/api/v1/login":
      res.status(500).send(`Please use Steam login with I Wanna Mod.`);
      return;
    case "/api/v1/steamlogin":
      // Do Steam login flow
      try {
        const serverResponse = await fetch(
          "http://make.fangam.es/api/v1/steamlogin",
          {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
            body: req.rawBody,
            method: "POST",
          }
        );

        if(serverResponse.status != 200) {
          res.status(serverResponse.status).send(`(Not IWMMod) ` + await serverResponse.text())
          return;
        }

        const decoded = await serverResponse.json();
        const userData:userDataPayload = jwtDecode(decoded.token);

        const mongoUser = await db.getUserByAuth(req.params.password);
        if(mongoUser) {
          res.status(500).send(`Whatchu tryna do *raised eyebrow*`)
          return;
        };

        await db.users.insertOne({
          username: userData.username,
          server: "https://make.fangam.es",
          password: req.params.password,
          mods: [],
        })

        res.status(200).send(decoded);
        return;
      } catch (e) {
        console.error(e);
        res.status(500).send(`Internal Server Error (IWMMod)`);
        return;
      }
    default:
      res.status(500).send(`Please login to IWMMod.`)
      break;
  }

  //res.status(500).send(`Not implemented`);

  /*const user = await db.getUserByAuth(req.params.password);

  if (!user) {
    //res.status(401).send(`Unauthorized`)
    //return;
  }*/
});

router.use(`/:password/img`, async (req, res, next) => {
  const fixedURL = `/` + req.originalUrl.split("/img/")[1];
  res.redirect(`http://images.make.fangam.es${fixedURL}`);
});

export default router;

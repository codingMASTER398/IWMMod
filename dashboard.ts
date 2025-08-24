import express from "express";
import cookieParser from 'cookie-parser';
import db from "./db";
import { timeSince } from "./utils";
import { modList, modEnum } from "./mods";

const router = express.Router();

router.use(`/`, express.static(`./public`))
router.use(cookieParser())

router.use(`/`, async (req, res, next)=>{
  const user = await db.getUserByAuth(req.cookies.auth);

  if(!user && !req.originalUrl.startsWith("/login")) {
    res.redirect(`/login`)
    return;
  } else if (user && req.originalUrl.startsWith("/login")) {
    res.redirect(`/`)
    return;
  }

  req.user = user;
  next();
})

router.get(`/login`, (req, res)=>{
  let auth = req.cookies.auth || Math.random().toString(36).substring(2);

  res.cookie("auth", auth)

  res.render(`login`, {
    URL: process.env.URL + "/" + auth
  })
})

router.get(`/login/regenerate`, (req, res)=>{
  res.cookie("auth", Math.random().toString(36).substring(2))
  res.redirect("/")
})

// Authorized URLs
router.get(`/`, (req, res)=>{
  res.render(`index`, {
    URL: process.env.URL + "/" + req.user.password,
    user: req.user,
    page: "index",
    timeSince
  })
})

router.get(`/servers`, (req, res)=>{
  // Not implemented
  res.render(`notImplemented`, {
    user: req.user,
    page: "servers"
  })
})

router.get(`/mods`, (req, res)=>{
  res.render(`mods`, {
    user: req.user,
    page: "mods",
    modList
  })
})

router.get(`/uploadmod`, (req, res)=>{
  // Not implemented
  res.render(`notImplemented`, {
    user: req.user,
    page: "uploadmod"
  })
})

router.get(`/hats`, (req, res)=>{
  // Not implemented
  res.render(`notImplemented`, {
    user: req.user,
    page: "hats"
  })
})

// Methods
router.post(`/setMods`, async (req, res)=>{
  const mods = JSON.parse(req.rawBody).mods.filter((mod)=>modEnum.includes(mod));

  await db.users.updateOne({
    password: req.user.password
  }, {
    $set: { mods }
  })

  res.status(200).send(`OK`)
})

export default router
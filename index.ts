// EXPRESS
import express from 'express'
import db from "./db";
import dashboardRouter from "./dashboard"
import proxyRouter from "./proxyRouter"
import dotenv from 'dotenv'

await db.setup();

dotenv.config({
  quiet: true
});

const app = express();

app.set(`view engine`, `ejs`)

app.use(`/`, proxyRouter)
app.use(`/`, dashboardRouter)

app.listen(2048)
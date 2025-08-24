import { passRequest, passResponse, takeWholeRequest } from "./mods";

export default async function through(req, res, inURL, url, log, mods) {
  if(log) {
    console.log(inURL)
    console.log(req.method, req.headers)
    if(req.body) {
      console.log(req.body)
    }
  }

  if(await takeWholeRequest(mods, req, res, inURL)) {
    return;
  }

  req = await passRequest(mods, req, inURL);

  fetch(`${url}${inURL}`, {
    headers: {
      Authorization: req.headers?.authorization || "",
      "user-agent": `IWM Private Server (Horizons)`,
      "content-type": req.headers?.["content-type"] || "",
    },
    body: req.rawBody || null,
    method: req.method,
  }).then(async (r) => {
    let t = await r.text();

    t = await passResponse(mods, t, inURL);

    res.status(r.status).send(t);
  });
}

import modMapData from "./modMapData";
import { modLevelMetadata } from "./modUtils";

const modList = [
  {
    name: "Fake admin",
    description: "Get access to admin-only tools, but most of them don't work.",
    safe: true,
  },
  {
    name: "Disable mapcount",
    description: "Disable the map count text",
    safe: true,
  },
  {
    name: "View in editor",
    description: "View any level in the editor, cleared or not",
    safe: true,
  },
  {
    name: "Level stats",
    description:
      "View extra level stats in level descriptions (play count, thumbs down)",
    safe: true,
  },
  {
    name: "Disable submission",
    description:
      "Don't allow cleared levels to be uploaded. Enable if you're messing with unsafe mods.",
    safe: true,
  },
  {
    name: "Flight",
    description: "Modifies levels to give infinite jumps.",
    safe: false,
  },
  {
    name: "Coins",
    description: "Modifies levels to give infinite coins.",
    safe: false,
  },
  {
    name: "Shield",
    description: "Modifies levels to give infinite shields.",
    safe: false,
  },
];
const modEnum = modList.map((mod) => mod.name);

function passRequest(mods, req, url): any {
  if (["GET", "HEAD"].includes(req.method)) {
    req.rawBody = null;
  }

  return req;
}

function passResponse(mods, res, url): any {
  // Parse as text and do funny things
  if(mods.includes("Fake admin")) res = res.replaceAll(`Admin":false`, `Admin":true`);

  // Parse as JSON and do funny things
  let json;

  try {
    json = JSON.parse(res);
  } catch (e) {
    // Not JSON, just return.
    return res;
  }

  // Manipulate JSON
  try {
    const mapData = json.MapData || json.CurMap?.MapData;

    if (mapData) {
      let patchedMapData = modMapData(
        res.split(`"MapData":"`)[1].split(`",`)[0],
        mods
      );

      if (json.MapData) json.MapData = patchedMapData;
      else json.CurMap.MapData = patchedMapData;
    }

    if (json[0]?.PlayerCount && json[0]?.BestTimeUsername) {
      // it's an array of levels
      json = json.map((t) => modLevelMetadata(mods, t));
    } else if (json.PlayerCount && json.BestTimeUsername) {
      // it's one level
      json = modLevelMetadata(mods, json);
    }
  } catch (e) {
    console.error(e);
  }

  return JSON.stringify(json);
}

function takeWholeRequest(mods, req, res, url): Boolean {
  if (
    (url.endsWith("/stop") || url.endsWith("/stop/")) &&
    mods.includes("Disable submission")
  ) {
    res.status(500).send(`Submission Disabled (Mod)`);
    return true;
  }

  if (url == "/api/v1/mapcount" && mods.includes("Disable mapcount")) {
    res.status(200).send(``);
    return true;
  }

  return false;
}

export { modList, modEnum, passRequest, passResponse, takeWholeRequest };

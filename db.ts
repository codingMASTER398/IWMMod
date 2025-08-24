// DB is on port 27328

import { MongoClient, ServerApiVersion, Collection } from "mongodb";

const uri = `mongodb://127.0.0.1:27328/`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

class db {
  users: Collection

  constructor() {

  }

  async setup() {
    await client.connect()

    const db = client.db("main");
    const users = db.collection("users");

    this.users = users;
  }

  async getUserByAuth(auth) {
    return await this.users.findOne({
      password: auth
    })
  }
}

const database = new db();

export default database;
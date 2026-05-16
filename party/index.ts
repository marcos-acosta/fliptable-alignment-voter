import type * as Party from "partykit/server";
import type {
  ClientToServerMessage,
  Point,
  VoteSnapshot,
} from "../shared/types";

const VOTE_PREFIX = "vote:";
const DB_NAME_KEY = "dbName";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  private avgPoint = (pts: Point[]): Point => {
    if (!pts.length) return { x: 0, y: 0 };
    const sum = pts.reduce(
      (s, p) => ({ x: s.x + p.x, y: s.y + p.y }),
      { x: 0, y: 0 },
    );
    return { x: sum.x / pts.length, y: sum.y / pts.length };
  };

  private async buildSnapshot(): Promise<VoteSnapshot> {
    const votesMap = await this.room.storage.list<Point>({
      prefix: VOTE_PREFIX,
    });
    const votes = [...votesMap.values()];
    const dbName =
      (await this.room.storage.get<string>(DB_NAME_KEY)) ?? "";
    return {
      type: "snapshot",
      dbName,
      votes,
      consensus: this.avgPoint(votes),
    };
  }

  private async broadcastSnapshot() {
    this.room.broadcast(JSON.stringify(await this.buildSnapshot()));
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );
    conn.send(JSON.stringify(await this.buildSnapshot()));
  }

  async onMessage(message: string, sender: Party.Connection) {
    const msg: ClientToServerMessage = JSON.parse(message);

    if (msg.type === "vote") {
      await this.room.storage.put<Point>(VOTE_PREFIX + sender.id, msg.point);
    } else if (msg.type === "new-db") {
      const existing = await this.room.storage.list({ prefix: VOTE_PREFIX });
      await this.room.storage.delete([...existing.keys()]);
      await this.room.storage.put(DB_NAME_KEY, msg.dbName);
    }

    await this.broadcastSnapshot();
  }

  async onClose(connection: Party.Connection) {
    await this.room.storage.delete(VOTE_PREFIX + connection.id);
    await this.broadcastSnapshot();
  }
}

Server satisfies Party.Worker;

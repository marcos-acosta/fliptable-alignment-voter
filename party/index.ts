import type * as Party from "partykit/server";
import type {
  ClientToServerMessage,
  ConsensusMessage,
  NewDbMessage,
  Point,
} from "../shared/types";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );
  }

  private avgPoint = (pts: Point[]): Point => {
    if (!pts.length) {
      return {x: 0, y: 0}
    }
    const sum = pts.reduce(
      (s, p) => ({ x: s.x + p.x, y: s.y + p.y }),
      { x: 0, y: 0 },
    );
    return { x: sum.x / pts.length, y: sum.y / pts.length };
  };

  async onMessage(message: string, sender: Party.Connection) {
    const msg: ClientToServerMessage = JSON.parse(message);

    if (msg.type === "vote") {
      await this.room.storage.put<Point>(sender.id, msg.point);
      const all = await this.room.storage.list<Point>();

      const out: ConsensusMessage = {
        type: "consensus",
        consensus: this.avgPoint([...all.values()]),
        numVoters: all.size
      };
      this.room.broadcast(JSON.stringify(out));
    } else if (msg.type == "new-db") {
      await this.room.storage.deleteAll()
      this.room.broadcast(JSON.stringify(msg), [sender.id])
    }
  }

  async onClose(connection: Party.Connection) {
    this.room.storage.delete(connection.id);
  }
}

Server satisfies Party.Worker;

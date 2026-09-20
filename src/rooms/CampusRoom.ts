import { Room, Client } from "colyseus";
import { CampusState, Player } from "./schema/PlayerState.js";

const ANIMATIONS = new Set(["Idle", "Walk", "Run", "Jump"]);

export class CampusRoom extends Room {
  maxClients = 200;
  autoDispose = false;
  state!: CampusState;

  onCreate() {
    this.setState(new CampusState());
    this.setPatchRate(50);

    console.log(`[CAMPUS] CREATED | ROOM: ${this.roomId}`);

    this.onMessage("move", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (!p || !data) return;

      p.x = Number.isFinite(data.x) ? data.x : p.x;
      p.y = Number.isFinite(data.y) ? data.y : p.y;
      p.z = Number.isFinite(data.z) ? data.z : p.z;
      p.qx = Number.isFinite(data.qx) ? data.qx : p.qx;
        p.qy = Number.isFinite(data.qy) ? data.qy : p.qy;
        p.qz = Number.isFinite(data.qz) ? data.qz : p.qz;
        p.qw = Number.isFinite(data.qw) ? data.qw : p.qw;

      p.animation = ANIMATIONS.has(data.animation)
        ? data.animation
        : "Idle";
    });
  }

  onJoin(client: Client, options: { name?: string }) {
    const p = new Player();
    p.name = options?.name || "Guest";

    this.state.players.set(client.sessionId, p);

    console.log(
      `[CAMPUS] JOINED | ID: ${client.sessionId} | NAME: ${p.name} | TOTAL: ${this.clients.length}`
    );
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);

    console.log(
      `[CAMPUS] LEFT | ID: ${client.sessionId} | TOTAL: ${this.clients.length}`
    );
  }
}
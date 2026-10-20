import { Room, Client } from "colyseus";
import { CampusState, Player } from "./schema/PlayerState.js";

const ANIMATIONS = new Set(["Idle", "Walk", "Run", "Jump", "Ride"]);
const WORDS_A = ["pod", "mint", "calm", "swift", "blue", "tiny", "happy", "cool", "bold", "sunny", "wild", "pixel", "cloud", "neon", "frost"];
const WORDS_B = ["sock", "fox", "wolf", "bear", "otter", "panda", "hawk", "cat", "koala", "frog", "owl", "moose", "duck", "tiger", "deer"];


export class CampusRoom extends Room {
  maxClients = 1000;
  autoDispose = false;
  state!: CampusState;


  private generateGuestName() {
    const used = new Set(
      Array.from(this.state.players.values(), p => p.name)
    );

    for (;;) {
      const name = `${WORDS_A[Math.floor(Math.random() * WORDS_A.length)]}_${WORDS_B[Math.floor(Math.random() * WORDS_B.length)]}_${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;
      if (!used.has(name)) return name;
    }
  }

  private updateOnlineCount() {
    this.broadcast("onlineCount", { count: this.clients.length });
  }

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

    this.onMessage("chat", (client, data) => {
      const message = typeof data?.message === "string"
        ? data.message.trim().slice(0, 300)
        : "";

      if (!message) return;

      const player = this.state.players.get(client.sessionId);
      const name = player?.name || "Guest";

      this.broadcast("chat", {
        sessionId: client.sessionId,
        name: player?.name || "Guest",
        message,
        timestamp: Date.now(),
      });
    });

  }

  onJoin(client: Client, options: { name?: string }) {
    this.updateOnlineCount();
    const p = new Player();
    const requestedName = options?.name?.trim().slice(0, 30);
    p.name = requestedName && requestedName.toLowerCase() !== "guest"
      ? requestedName
      : this.generateGuestName();


    this.state.players.set(client.sessionId, p);
    console.log(
      `[CAMPUS] JOINED | ID: ${client.sessionId} | NAME: ${p.name} | TOTAL: ${this.clients.length}`
    );
  }

  onLeave(client: Client) {
    this.updateOnlineCount();
    this.state.players.delete(client.sessionId);

    console.log(
      `[CAMPUS] LEFT | ID: ${client.sessionId} | TOTAL: ${this.clients.length}`
    );
  }
}
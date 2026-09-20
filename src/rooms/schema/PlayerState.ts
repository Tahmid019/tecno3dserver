import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;
  @type("string") name = "Guest";
  @type("string") animation = "Idle";
  @type("number") qx = 0;
    @type("number") qy = 0;
    @type("number") qz = 0;
    @type("number") qw = 1;
}

export class CampusState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
}
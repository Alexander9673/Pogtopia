import { EventEmitter } from "events";
import * as Redis from "ioredis";
import * as Mongo from "mongodb";





/**
 * Options for the CDN to use
 */
interface CDNOptions {
  /**
   * The host site of the CDN
   */
  host: string

  /**
   * The url of the CDN
   */
  url: string
}






/**
 * The config for the server
 */
interface ServerConfig {
  /**
   * The port for the server to use
   */
  port: number

  /**
   * The options for the CDN
   */
  cdn: CDNOptions
}






/**
 * The general configuration
 */
interface Config {
  server: ServerConfig
}






/**
 * Options for the TankPacket
 */
interface TankOptions {
  /**
   * The type of the Tank Packet
   */
  type: number

  /**
   * The netID that's associated with the packet
   */
  netID?: number

  /**
   * The target netID for the packet. Not the same with "netID"
   */
  targetNetID?: number

  /**
   * The state of the packet.
   */
  state?: number

  /**
   * The info of the item used (name should be changed) or the delay on when to execute the packet (in ms).
   */
  itemInfo?: number

  /**
   * The X position of a player. (float)
   */
  playerPosX?: number

  /**
   * The Y position of a player. (float)
   */
  playerPosY?: number

  /**
   * The speed of the player on the x-axis. (float)
   */
  playerSpeedX?: number

  /**
   * The speed of the player on the y-axis. (float)
   */
  playerSpeedY?: number

  /**
   * The X position of where the player punched.
   */
  playerPunchX?: number

  /**
   * The Y position of where the player punched.
   */
  playerPunchY?: number

  /**
   * A callback to be executed when adding Extra Data.
   */
  extraData?: () => Buffer
}






/**
 * Options for the Variant Packet
 */
interface VariantOptions {
  /**
   * The delay on when to execute the packet (in ms).
   */
  delay?: number

  /**
   * The netID associated with the Packet.
   */
  netID?: number
}






interface PeerData {
  /**
   * The connectID of a user
   */
  connectID?: number

  /**
   * A unique identifier for a peer, it would just be the username for non-guest accounts and rid for guest.
   */
  uid?: string

  /**
   * The password of a user
   */
  password?: string

  /**
   * The name to display for the user
   */
  displayName?: string

  /**
   * The user id of the user, not to be mixed with uid.
   */
  userID?: number

  /**
   * The country of the player
   */
  country?: string

  /**
   * Current world of a player
   */
  currentWorld?: string

  /**
   * Position of a player on the x-axis
   */
  x?: number

  /**
   * Position of a player on the y-axis
   */
  y?: number

  /**
   * Whether or not each player has moved
   */
  hasMovedInWorld?: boolean;
}






interface ItemsDat {
  packet: TankPacket
  content: Buffer
  hash: number
}






interface Collections {
  players: Mongo.Collection,
  worlds: Mongo.Collection
}






interface OnSuperMainArgs {
  arg3: string
  arg4: string
}





interface WorldTile {
  fg: number
  bg: number
  x: number
  y: number
  doorClosed?: boolean
  label?: string
  doorDestination?: string
}






interface WorldData {
  name: string
  width?: number
  height?: number
  tileCount?: number
  tiles?: WorldTile[]
}






export class World {
  /**
   * The data of the world
   */
  public data: WorldData;

  /**
   * Creates a new instances of the world class.
   * @param server The server object
   * @param data The world data
   */
  constructor(public server: Server, private data?: WorldData);

  /**
   * Whether or not the world has it's data.
   */
  public hasData(): boolean;

  /**
   * Fetches the world data from the cache, or db if not present. This will set the `.data` property. This doesn't auto generate worlds if not present.
   */
  public async fetch(): Promise<void>;
  
  /**
   * Generates a world, it will save to cache after generating
   */
  public async generate(): Promise<void>;

  /**
   * Serilizes the world packet. Fetches automatically from either the cache or database, if not present. Will also try to generate the world.
   */
  public async serialize(): Promise<TankPacket>;

  /**
   * Saves world data to cache
   */
  public async saveToCache(): Promise<void>;

  /**
   * Saves world data to the database
   */
  public async saveToDb(): Promise<void>;

  /**
   * Deletes the world from cache
   */
  public async uncache(): Promise<void>;
}






/**
 * A class that represents the Server
 */
export class Server extends EventEmitter {
  /**
   * Our redis client
   */
  public redis: Redis;

  /**
   * Items dat object
   */
  public items: ItemsDat;

  /**
   * MongoDB Collections
   */
  public collections: Collections;

  /**
   * The current avaiable user id
   */
  public availableUserID: number;

  /**
   * Arguments for the OnSuperMain packet
   */
  public OnSuperMainArgs: OnSuperMainArgs;

  /**
   * Creates a new instance of the Server class
   * @param config The configuration for the server
   */
  constructor(config: Config);

  /**
   * Fetches the CDN Data passed from the config
   */
  getCDN(): CDNOptions | null;

  /**
   * Reset the values of the server.dat file
   */
  clearServerDat(): void;

  /**
   * Start the server
   */
  public start(): void;

  /**
   * Pretty much a console.log but it's asynchronous
   * @param args The arguments to log, same as console.log.
   */
  public log(...args: any[]): Promise<void>;

  /**
   * Set the handler for a specific event
   * @param type The event to handle
   * @param callback The callback for that event
   */
  public setHandler(type: "connect" | "disconnect", callback: (peer: Peer) => void): void;

  /**
   * Set the handler for a specific event
   * @param type The event to handle
   * @param callback The callback for that event
   */
  public setHandler(type: "receive", callback: (peer: Peer, packet: Buffer) => void): void;

  /**
   * Set the items.dat to use, this will create the packet and the hash
   * @param file The items.dat file content
   */
  public setItemsDat(file: Buffer): void;

  /**
   * Converts a string packet data to map, this will split the `\n` and `|`.
   * @param packet The string packet
   */
  public stringPacketToMap(packet: Buffer): Map<string, string>;

  /**
   * Loops through each player in the cache
   * @param type The type to loop
   * @param callback The callback to run per element
   */
  public async forEach(type: "player", callback: (peer: Peer) => void): Promise<void>;

  /**
   * Loops through each world in the cache
   * @param type The type to loop
   * @param callback The callback to run per element
   */
  public async forEach(type: "world", callback: (world: World) => void): Promise<void>;
}






/**
 * A class to represent a Variant Packet
 */
export class Variant {
  /**
   * Creates a new Variant
   * @param options The options for the Variant
   * @param args The arguments for the Variant
   */
  constructor(public options: VariantOptions, public args: (string | number | number[])[]);

  /**
   * Parse the Variant Packet, convert it to bytes.
   */
  public parse(): Buffer; 

  /**
   * Creates a new Variant Packet
   * @param options Options for the variant packet
   * @param args Arguments of the Variant packet
   */
  public static from(options: string | VariantOptions, ...args: (string|number|number[])[]): Variant;
}





export class TextPacket {
  /**
   * Creates a new Text Packet
   * @param type The type to use
   * @param text The text/string for it to contain
   */
  constructor(public type: number, public text?: string);

  /**
   * Converts a text or a packet to a TextPacket class
   * @param type The type to set for the packet
   * @param values The text to place to the packet
   */
  public static from(type?: number, ...values: string[]): TextPacket;
}






interface TankPacket extends TankOptions { }
/**
 * A class that represents a TankPacket
 */
export class TankPacket {
  /**
   * Creates a new instance of the TankPacket
   * @param options The options for the TankPacket
   */
  constructor(private options: TankOptions);

  /**
   * Setup the properties of the TankPacket
   */
  private setup();

  /**
   * Create a new TankPacket
   * @param options The options for the TankPacket or the Buffer to convert to a TankPacket
   */
  public static from(options: TankOptions | Buffer): TankPacket;

  /**
   * Parse the TankPacket to bytes
   */
  public parse(): Buffer;
}






/**
 * A class that represents a connected peer
 */
export class Peer {
  /**
   * Creates a new instance of the peer
   * @param {Server} server The instance of the server
   * @param {PeerData} data The user data of the peer
   */
  constructor(private server: Server, public data: PeerData = {});

  /**
   * Creates a new player to be saved to the database. This will also set the `data` property of a peer
   * @param data The data of the peer to create
   * @param saveToCache Whether or not to save the data to cache as well
   */
  public async create(data: PeerData, saveToCache?: boolean): Promise<void>;

  /**
   * Sends the packet to the peer
   * @param data The packet to send
   */
  public send(data: Buffer | TextPacket | Variant | TankPacket): void;

  /**
   * Disconnects a peer
   * @param type The type of disconnection.
   */
  public async disconnect(type?: "later" | "now"): Promise<void>;

  /**
   * Request the login information from the peer. This will emit the "receive" event.
   */
  public requestLoginInformation(): void

  /**
   * Saves the player to the database.
   */
  public async saveToDb(): Promise<void>;

  /**
   * Saves player data to the cache.
   */
  public async saveToCache(): Promise<void>;

  /**
   * Check if proper player data is present.
   */
  public hasPlayerData(): boolean;

  /**
   * Whether or not a player is already in cache
   */
  public async alreadyInCache(): Promise<boolean>;

  /**
   * Fetches the peer data from the cache or database
   * @param type Where to fetch the data
   */
  public async fetch(type: "cache" | "db", filter: PeerData = {}): Promise<void>;

  /**
   * Joins a world
   * @param name The name of the world
   */
  public async join(name: string): Promise<void>;

  /**
   * Plays an audio file.
   * @param file The name of the file
   * @param delay The delay, in ms on when to play.
   */
  public audio(file: string, delay: number = 0)
}






interface HTTPOptions {
  serverIP?: string
  serverPort?: string | number
  httpsEnabled?: boolean
}






/**
 * The http server handler
 */
export const Http = {
  /**
   * Start the HTTP server
   * @param opts Options for the HTTP Server
   */
  start(opts?: HTTPOptions): void
}





/**
 * Message types for what Growtopia Sends, or what to send.
 */
export enum PacketMessageTypes {
  REQUEST_LOGIN_INFO  = 0x1,
  STRING              = 0x2,
  ACTION              = 0x3,
  TANK_PACKET         =  0x4
}






/**
 * Variant Argument Types
 */
export enum VariantTypes {
  NONE      = 0x0,
  FLOAT_1   = 0x1,
  STRING    = 0x2,
  FLOAT_2   = 0x3,
  FLOAT_3   = 0x4,
  UINT      = 0x5,
  INT       = 0x9
}
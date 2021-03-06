const native = require("../../native/build/Release/index");
const TextPacket = require("./Packet/TextPacket");
const Variant = require("./Packet/Variant");
const TankPacket = require("./Packet/TankPacket");

// Reason why this is not exported and added in the typings file cause it's used as Core only, not exposed to the api itself.

/**
 * @callback Emitter
 * @param {string | symbol} event
 * @param {...any[]} args
 * @returns {boolean}
 */

module.exports = class NativeWrapper {
  constructor() { }

  /**
   * Initiate ENet, and sets the port to use.
   * @static
   * @param {number} port
   */
  static Init(port) {
    native.init(port);
  }

  /**
   * Sets the Event Emitter to be used
   * @static
   * @param {Emitter} emitter
   */
  static setEmitter(emitter) {
    native.set_event_emitter(emitter);
  }

  /**
   * Creates the ENet Host
   * @static
   */
  static createHost() {
    native.host_create();
  }

  /**
   * Receive events. This function must be ran in a loop
   * @static
   */
  static receive() {
    native.host_event_recieve();
  }

  /**
   * Sends a packet to the specific connectID.
   * @static
   * @param {Buffer|TextPacket|Variant|TankPacket} packet
   * @param {number} connectID
   */
  static send(packet, connectID) {
    switch (packet.constructor.name) {
      case "Buffer": {
        native.send_packet(packet, connectID);
        break;
      }

      case "TextPacket": {
        const buffer = (() => {
          const buf = Buffer.alloc(5 + packet.text.length);

          buf.writeUInt32LE(packet.type);
          buf.write(packet.text, 4);

          return buf;
        })();

        native.send_packet(buffer, connectID);
        break;
      }

      case "TankPacket":
      case "Variant": {
        native.send_packet(packet.parse(), connectID);
        break;
      }
    }
  }

  /**
   * Sends multiple packets to the specific connectID.
   * @static
   * @param {(Buffer|TextPacket|Variant|TankPacket)[]} packets
   * @param {number} connectID
   */
  static send_multiple(packets, connectID) {
    packets = packets.map(
      packet => {
        let val;

        switch (packet.constructor.name) {    
          case "TextPacket": {
            const buffer = (() => {
              const buf = Buffer.alloc(5 + packet.text.length);
    
              buf.writeUInt32LE(packet.type);
              buf.write(packet.text, 4);
    
              return buf;
            })();
    
            val = buffer;
            break;
          }
    
          case "TankPacket":
          case "Variant": {
            val = packet.parse()
            break;
          }

          default: {
            val = packet;
            break;
          }
        }

        return val
      }
    )

    native.send_multiple(packets, packets.length, connectID)
  }

  /**
   * Disconnect a peer
   * @param {"now"|"later"} [type] What type of disconnect method
   * @param {number} connectID The connectID of the peer
   */
  static disconnect(type, connectID) {
    let typeAsNum;
    type = type?.toLowerCase();

    switch (type) {
      case "now": {
        typeAsNum = 1;
        break;
      }

      case "later": {
        typeAsNum = 2;
        break;
      }

      default: {
        typeAsNum = 0;
        break;
      }
    }

    native.peer_disconnect(typeAsNum, connectID);
  }

  static isConnected(connectID) {
    return native.is_connected(connectID)
  }
}
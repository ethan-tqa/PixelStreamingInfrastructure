import { SignallingProtocol, BaseMessage } from '@epicgames-ps/lib-pixelstreamingcommon-ue5.5';
import { EventEmitter } from 'events';
import { Logger } from './Logger';
import { IMessageLogger } from './LoggingUtils';

/**
 * An interface that describes a player that can be added to the
 * player registry.
 */
export interface IPlayer extends IMessageLogger {
	playerId: string;
	protocol: SignallingProtocol;

	sendMessage(message: BaseMessage): void;
}

/**
 * Handles all the player connections of a signalling server and
 * can be used to lookup connections by id etc.
 * Fires events when players are added or removed.
 * Events:
 *   'added': (playerId: string) Player was added.
 *   'removed': (playerId: string) Player was removed.
 */
export class PlayerRegistry extends EventEmitter {
	private players: Map<string, IPlayer> = new Map();
	private playerCount: number;
	private nextPlayerId: number;

	constructor() {
		super();
		this.players = new Map();
		this.playerCount = 0;
		this.nextPlayerId = 0;
	}

	/**
	 * Assigns a unique id to the player and adds it to the registry
	 */
	add(player: IPlayer): void {
		player.playerId = this.getUniquePlayerId();
		this.players.set(player.playerId, player);
		this.playerCount++;
		this.emit('added', player.playerId);
		Logger.info(`Registered new player: ${player.playerId}`);
	}

	/**
	 * Removes a player from the registry. Does nothing if the id
	 * does not exist.
	 */
	remove(player: IPlayer): void {
		if (!this.players.has(player.playerId)) {
			return;
		}

		this.emit('removed', player.playerId);
		this.players.delete(player.playerId);
		this.playerCount--;

		Logger.info(`Unregistered player: ${player.playerId}`);
	}

	/**
	 * Tests if a player id exists in the registry.
	 */
	has(playerId: string): boolean {
		return this.players.has(playerId);
	}

	/**
	 * Gets a player from the registry using the player id.
	 * Returns undefined if the player doesn't exist.
	 */
	get(playerId: string): IPlayer | undefined {
		return this.players.get(playerId);
	}

	getPlayerIds(): string[] {
		return Array.from(this.players.keys());
	}

	private getUniquePlayerId(): string {
		const newPlayerId = `Player${this.nextPlayerId}`;
		this.nextPlayerId++;
		return newPlayerId;
	}
}

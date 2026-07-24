// enumeration for rhyming groups
export const Rhyme = {
	oop: 0,
	elly: 1,
	ock: 2,
	our: 3,
	ew: 4,
} as const;
type RhymeType = typeof Rhyme[keyof typeof Rhyme];

// enumeration for card symbols
export const Symbol = {
	Sun: 0,
	Moon: 1,
	Mushroom: 3,
	Frog: 4,
} as const;
type SymbolType = typeof Symbol[keyof typeof Symbol];


export class CardFace {
	// === PROPERTIES === //
	private name_: string;
	private rhymeGroup_: RhymeType;
	private symbol_: SymbolType;
	private isStar_: boolean;

	constructor(name: string, rhymeGroup: RhymeType, symbol: SymbolType, isStar: boolean) {
		this.name_ = name;
		this.rhymeGroup_ = rhymeGroup;
		this.symbol_ = symbol;
		this.isStar_ = isStar;
	}

	// === GETTERS === //
	get name(): string {
		return this.name_;
	}
	get rhymeGroup(): RhymeType {
		return this.rhymeGroup_;
	}
	get symbol(): SymbolType {
		return this.symbol_;
	}
	get isStar(): boolean {
		return this.isStar_;
	}

	// === HELPERS === //
	public getBgImagePath(): string {
		let formattedName = this.name_
			.toLowerCase()
			.trim()
			.replace(/['’]/g, '')        	// remove single quotes and apostrophes
			.replace(/[^a-z0-9]/g, '_')   // replace other non-alphanumeric charactgers with _
			.replace(/_+/g, '_');
		return `/assets/cards/${formattedName}.png`;
	}
	public getSymbolAssetPath(): string {
		switch (this.symbol) {
			case Symbol.Sun:
				return '/assets/suits/sun.png';
			case Symbol.Moon:
				return '/assets/suits/moon.png';
			case Symbol.Mushroom:
				return '/assets/suits/mushroom.png';
			case Symbol.Frog:
				return '/assets/suits/frog.png';
		}
	}
}

export class Card {
	// === PROPERTIES === //
	private id_: string;
	private goblinFace_: 	CardFace;
	private fairyFace_: 	CardFace;
	private currentSide_: 'Fairy' | 'Goblin';

	constructor(id: string, goblin: CardFace, fairy: CardFace) {
		this.id_ = id;
		this.goblinFace_ = goblin;
		this.fairyFace_ = fairy;
		this.currentSide_ = 'Goblin';
	}

	// === GETTERS === //
	get id(): string {
		return this.id_;
	}
	get goblinFace(): CardFace {
		return this.goblinFace_;
	}
	get fairyFace(): CardFace {
		return this.fairyFace_;
	}
	get activeFace(): CardFace {
		if (this.currentSide_ == 'Goblin')
			return this.goblinFace_;
		else
			return this.fairyFace_;
	}
	get isGoblin(): boolean {
		return this.currentSide_ == 'Goblin';
	}
	get isFairy(): boolean {
		return this.currentSide_ == 'Fairy';
	}

	// === HELPERS === //
	public flip(): void {
		if (this.isGoblin)
			this.currentSide_ = 'Fairy';
		else
			this.currentSide_ = 'Goblin'
	}
	public shouldFlip(target: Card): boolean {
		let playedFace: CardFace = this.activeFace;
		let targetFace: CardFace = target.activeFace;

		// If the played card (this) is a star card, any target card is flipped.
		if (playedFace.isStar)
			return true;

		// If the played card's (this) rhyme group is the same as the target card's, the target card is flipped.
		if (playedFace.rhymeGroup == targetFace.rhymeGroup)
			return true;

		return false;
	}
	public shouldPickUp(target: Card): boolean {
		// If the played card's (this) symbol matches the target card's symbol, the target card is picked up.
		return this.activeFace.symbol == target.activeFace.symbol;
	}
}

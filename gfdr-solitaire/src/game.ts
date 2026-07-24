import { Rhyme, Symbol, Card, CardFace } from "./card";

// === Game Options === //
export type GameMode = 'normal' | 'challenge';
export type DealSize = 5 | 6 | 7;

export interface GameOptions {
	dealSize: DealSize;
	mode: GameMode;
}

export const DEFAULT_OPTIONS: GameOptions = {
	dealSize: 7,
	mode: 'challenge',
};

// === Dealing === //
const starCards: Card[] = [
	new Card(/* Nervous Nelly / Vanilla Scoop */
		"000",
		new CardFace("Nervous Nelly", Rhyme.elly, Symbol.Sun, true),
		new CardFace("Vanilla Scoop", Rhyme.oop, Symbol.Moon, false)
	),
	new Card(/* Chicken Pock / Willow Sue */
		"001",
		new CardFace("Chicken Pock", Rhyme.ock, Symbol.Moon, true),
		new CardFace("Willow Sue", Rhyme.ew, Symbol.Sun, false)
	),
	new Card(/* Dusty Dour / Baby Blue */
		"002",
		new CardFace("Dusty Dour", Rhyme.our, Symbol.Mushroom, true),
		new CardFace("Baby Blue", Rhyme.ew, Symbol.Frog, false)
	),
	new Card(/* Salamander Snoop / Petal Flower */
		"003",
		new CardFace("Salamander Snoop", Rhyme.oop, Symbol.Frog, true),
		new CardFace("Petal Flower", Rhyme.our, Symbol.Mushroom, false)
	),
];
const otherCards: Card[] = [
	// SUN GOBLIN <==> MOON FAIRY
	new Card(/* Goblin Soup / Morning Dew */
		"004",
		new CardFace("Goblin Soup", Rhyme.oop, Symbol.Sun, false),
		new CardFace("Morning Dew", Rhyme.ew, Symbol.Moon, true)
	),
	new Card(/* Old Man Sock / Sweet and Sour */
		"005",
		new CardFace("Old Man Sock", Rhyme.ock, Symbol.Sun, false),
		new CardFace("Sweet and Sour", Rhyme.our, Symbol.Moon, false)
	),
	new Card(/* Needs a Shower / Snowflake Shelly */
		"006",
		new CardFace("Needs a Shower", Rhyme.our, Symbol.Sun, false),
		new CardFace("Snowflake Shelly", Rhyme.elly, Symbol.Moon, false)
	),
	new Card(/* O.P. You / Poppy Smock */
		"007",
		new CardFace("O.P. You", Rhyme.ew, Symbol.Sun, false),
		new CardFace("Poppy Smock", Rhyme.ock, Symbol.Moon, false)
	),

	// MOON GOBLIN <==> SUN FAIRY
	new Card(/* He So Smelly / Candy Rock */
		"008",
		new CardFace("He So Smelly", Rhyme.elly, Symbol.Moon, false),
		new CardFace("Candy Rock", Rhyme.ock, Symbol.Sun, true)
	),
	new Card(/* Gobble T. Goop / P.B. and Jelly */
		"009",
		new CardFace("Gobble T. Goop", Rhyme.oop, Symbol.Moon, false),
		new CardFace("P.B. and Jelly", Rhyme.elly, Symbol.Sun, false)
	),
	new Card(/* Nappy Hour / Lemon Loop */
		"010",
		new CardFace("Nappy Hour", Rhyme.our, Symbol.Moon, false),
		new CardFace("Lemon Loop", Rhyme.oop, Symbol.Sun, false)
	),
	new Card(/* Full Moon Moo / Pixie Power */
		"011",
		new CardFace("Full Moon Moo", Rhyme.ew, Symbol.Moon, false),
		new CardFace("Pixie Power", Rhyme.our, Symbol.Sun, false)
	),

	// MUSHROOM GOBLIN <==> FROG FAIRY
	new Card(/* Earwax Stew / Kokopelli */
		"012",
		new CardFace("Earwax Stew", Rhyme.ew, Symbol.Mushroom, false),
		new CardFace("Kokopelli", Rhyme.elly, Symbol.Frog, true)
	),
	new Card(/* Dastardly Droop / Goldie Lock */
		"013",
		new CardFace("Dastardly Droop", Rhyme.oop, Symbol.Mushroom, false),
		new CardFace("Goldie Lock", Rhyme.ock, Symbol.Frog, false)
	),
	new Card(/* Vermin Vermicelli / Dewdrop Shower */
		"014",
		new CardFace("Vermin Vermicelli", Rhyme.elly, Symbol.Mushroom, false),
		new CardFace("Dewdrop Shower", Rhyme.our, Symbol.Frog, false)
	),
	new Card(/* Cobweb Shock / Hula Hoop */
		"015",
		new CardFace("Cobweb Shock", Rhyme.ock, Symbol.Mushroom, false),
		new CardFace("Hula Hoop", Rhyme.oop, Symbol.Frog, false)
	),

	// FROG GOBLIN <==> MUSHROOM FAIRY
	new Card(/* Spidery Glue / Rainbow Swoop */
		"016",
		new CardFace("Spidery Glue", Rhyme.ew, Symbol.Frog, false),
		new CardFace("Rainbow Swoop", Rhyme.oop, Symbol.Mushroom, true)
	),
	new Card(/* Big Big Belly / Penny Clue */
		"017",
		new CardFace("Big Big Belly", Rhyme.elly, Symbol.Frog, false),
		new CardFace("Penny Clue", Rhyme.ew, Symbol.Mushroom, false)
	),
	new Card(/* Cuckoo Clock / Lucky O'Kelly */
		"018",
		new CardFace("Cuckoo Clock", Rhyme.ock, Symbol.Frog, false),
		new CardFace("Lucky O'Kelly", Rhyme.elly, Symbol.Mushroom, false)
	),
	new Card(/* Cringe and Cower / Hickory Dock */
		"019",
		new CardFace("Cringe and Cower", Rhyme.our, Symbol.Frog, false),
		new CardFace("Hickory Dock", Rhyme.ock, Symbol.Mushroom, false)
	),
];

export function dealCards(n: number): [Card[], Card[]] {
	let hand: Card[] = [];
	let field: Card[] = [];

	// shuffle deck
	let deck = [...otherCards];
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}

	// deal hand (1 random star card, n-1 other cards)
	hand.push(starCards[Math.floor(Math.random() * 4)]);
	for (let i = 0; i < n - 1; i++)
		hand.push(deck.pop()!);

	// deal fairy ring (n cards)
	for (let i = 0; i < n; i++) {
		let c: Card = deck.pop()!;
		c.flip(); // flip to fairy
		field.push(c);
	}

	return [hand, field];
};

// === Clone Card === //
export function cloneCard(card: Card): Card {
	const clone = new Card(card.id, card.goblinFace, card.fairyFace);
	if (card.isFairy) clone.flip();
	return clone;
}

// === Win Condition Check === //
export function checkWinCondition(
	mode: GameMode,
	handRow1: Card[],
	fieldCards: Card[]
): boolean {
	if (handRow1.length > 0) return false;

	if (mode === 'normal') return true;

	// challenge mode also requires every field card to be fairy-side up
	return fieldCards.length > 0 && fieldCards.every((c) => c.isFairy);
}

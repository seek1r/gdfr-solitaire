import { Card } from './card';
import { cloneCard } from './game';

export interface BoardSnapshot {
	fieldCards: Card[];
	handRow1: Card[];
	handRow2: Card[];
}

// Clone current game state
export function snapshotBoard(fieldCards: Card[], handRow1: Card[], handRow2: Card[]): BoardSnapshot {
	return {
		fieldCards: fieldCards.map(cloneCard),
		handRow1: handRow1.map(cloneCard),
		handRow2: handRow2.map(cloneCard),
	};
}

import { Card } from './card';
import { createPlaceholder, animateCardGlide, animateCollapsePlaceholders } from './animations';

export async function handlePickupAndCloseField(
	playedCard: Card,
	fieldCards: Card[],
	handRow1: Card[],
	handRow2: Card[]
): Promise<{ fieldCards: Card[]; handRow1: Card[]; handRow2: Card[] }> {
	const fieldRow = document.querySelector<HTMLElement>('#field-row');
	const hand1Row = document.querySelector<HTMLElement>('#hand-row-1');
	const hand2Row = document.querySelector<HTMLElement>('#hand-row-2');

	if (!fieldRow || !hand1Row || !hand2Row) {
		return { fieldCards, handRow1, handRow2 };
	}

	// 1. Identify which cards should be picked up
	const cardsToPickUp = fieldCards.filter((target) => {
		return target.id !== playedCard.id && playedCard.shouldPickUp(target);
	});

	const fieldPlaceholders: HTMLElement[] = [];

	// 2. Pick up cards one by one (glide card to hand, leave a placeholder on the field)
	for (const target of cardsToPickUp) {
		const cardEl = fieldRow.querySelector<HTMLElement>(`.card[data-id="${target.id}"]`);
		if (!cardEl) continue;

		const placeholder = createPlaceholder(fieldRow, cardEl);
		fieldPlaceholders.push(placeholder);

		const destinationRow = target.isGoblin ? hand1Row : hand2Row;
		await animateCardGlide(cardEl, destinationRow);

		fieldCards = fieldCards.filter((c) => c.id !== target.id);
		if (target.isGoblin) {
			handRow1.push(target);
		} else {
			handRow2.push(target);
		}
	}

	// 3. Collapse every gap left on the field at once, in a single motion
	if (fieldPlaceholders.length > 0) {
		await animateCollapsePlaceholders(fieldRow, fieldPlaceholders);
	}

	return { fieldCards, handRow1, handRow2 };
}

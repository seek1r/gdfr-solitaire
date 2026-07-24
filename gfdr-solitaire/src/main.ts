import './style.css';
import { Card } from './card';
import { dealCards, checkWinCondition, type GameOptions } from './game';
import { renderBoard, type SourceZone } from './render';
import { createPlaceholder, animateCardGlide, animateShiftAndCloseGap, sleep } from './animations';
import { handlePickupAndCloseField } from './turn';
import { snapshotBoard, type BoardSnapshot } from './state';
import { initMenu, showScreen, showConfirm, showWinModal } from './menu';

// === Game State === //
let fieldCards: Card[] = [];
let handRow1: Card[] = [];
let handRow2: Card[] = [];
let currentOptions: GameOptions = { dealSize: 7, mode: 'normal' };
let previousState: BoardSnapshot | null = null;
let allowInput = true;

// === DOM Refs === //
const fieldContainer = document.querySelector<HTMLDivElement>('#field-row')!;
const handRow1Container = document.querySelector<HTMLDivElement>('#hand-row-1')!;
const handRow2Container = document.querySelector<HTMLDivElement>('#hand-row-2')!;
const undoBtn = document.querySelector<HTMLButtonElement>('#undo-btn')!;
const newGameBtn = document.querySelector<HTMLButtonElement>('#new-game-btn')!;
const menuBtn = document.querySelector<HTMLButtonElement>('#menu-btn')!;

// === Rendering === //
function render(): void {
	renderBoard(
		{ fieldCards, handRow1, handRow2 },
		{ field: fieldContainer, hand1: handRow1Container, hand2: handRow2Container },
		onCardClick
	);
	undoBtn.disabled = previousState === null;
}

// === Dealing and Setup === //
function dealInitialHand(options: GameOptions): void {
	currentOptions = options;
	[handRow1, fieldCards] = dealCards(options.dealSize);
	handRow2 = [];
	previousState = null;
	allowInput = true;
	render();
}

function checkAndHandleWin(): void {
	const won = checkWinCondition(currentOptions.mode, handRow1, fieldCards);
	if (!won) return;

	allowInput = false;
	const message =
		currentOptions.mode === 'normal'
			? 'Your hand is free of goblins — you win!'
			: 'Every card is fairy-side up — you win!';

	showWinModal(
		message,
		() => dealInitialHand(currentOptions),
		() => showScreen('menu-screen')
	);
}

// === Turn Logic === //
async function onCardClick(card: Card, cardEl: HTMLElement, sourceZone: SourceZone): Promise<void> {
	if (!allowInput) return;
	if (sourceZone === 'field') return; // only hand cards can be played

	const sourceHandRow = cardEl.parentElement;
	if (!sourceHandRow) return;

	allowInput = false;

	// snapshot state before mutating
	previousState = snapshotBoard(fieldCards, handRow1, handRow2);
	undoBtn.disabled = true;

	// ------------------------------------------------------------
	// 1. Play card and insert placeholder in hand
	// ------------------------------------------------------------
	const placeholderInHand = createPlaceholder(sourceHandRow, cardEl);
	await animateCardGlide(cardEl, fieldContainer);

	fieldCards.push(card);
	if (sourceZone === 'hand1') handRow1 = handRow1.filter((c) => c.id !== card.id);
	if (sourceZone === 'hand2') handRow2 = handRow2.filter((c) => c.id !== card.id);

	// ------------------------------------------------------------
	// 2. Flip matching cards on the field, one by one
	// ------------------------------------------------------------
	const cardsToFlip = fieldCards.filter((target) => {
		return target.id !== card.id && card.shouldFlip(target);
	});

	for (const target of cardsToFlip) {
		target.flip();

		const targetEl = document.querySelector<HTMLElement>(`.card[data-id="${target.id}"]`);
		if (targetEl) {
			targetEl.classList.toggle('show-fairy', target.isFairy);
		}

		await sleep(300);
	}

	// ------------------------------------------------------------
	// 3. Close the gap left in the hand
	// ------------------------------------------------------------
	await animateShiftAndCloseGap(sourceHandRow, placeholderInHand);

	// ------------------------------------------------------------
	// 4. Pick up matching cards from the field, then collapse all
	//    resulting field gaps together
	// ------------------------------------------------------------
	const updated = await handlePickupAndCloseField(card, fieldCards, handRow1, handRow2);
	fieldCards = updated.fieldCards;
	handRow1 = updated.handRow1;
	handRow2 = updated.handRow2;

	render();
	allowInput = true;

	checkAndHandleWin();
}

// === Controls === //
undoBtn.addEventListener('click', () => {
	if (!allowInput || !previousState) return;
	fieldCards = previousState.fieldCards;
	handRow1 = previousState.handRow1;
	handRow2 = previousState.handRow2;
	previousState = null;
	render();
});

newGameBtn.addEventListener('click', async () => {
	if (!allowInput) return;
	const confirmed = await showConfirm('Start a new game? Your current progress will be lost.');
	if (confirmed) dealInitialHand(currentOptions);
});

menuBtn.addEventListener('click', async () => {
	if (!allowInput) return;
	const confirmed = await showConfirm('Return to the main menu? Your current progress will be lost.');
	if (confirmed) showScreen('menu-screen');
});

// === Menu === //
initMenu((options) => {
	showScreen('game-screen');
	dealInitialHand(options);
});

import { updateRowOverlaps } from './render';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Creates a placeholder element in place of a moved card
export function createPlaceholder(parentRow: HTMLElement, cardEl: HTMLElement): HTMLElement {
	const placeholder = document.createElement('div');
	placeholder.className = 'card-placeholder';
	parentRow.insertBefore(placeholder, cardEl);
	return placeholder;
}

// Moves a card from it's current position on screen to a new section.
export function animateCardGlide(cardEl: HTMLElement, targetContainer: HTMLElement): Promise<void> {
	return new Promise((resolve) => {
		const startRect = cardEl.getBoundingClientRect();

		// move card DOM element to target container
		targetContainer.appendChild(cardEl);

		// recalculate overlap before movement
		updateRowOverlaps();

		const endRect = cardEl.getBoundingClientRect();

		// translate
		const deltaX = startRect.left - endRect.left;
		const deltaY = startRect.top - endRect.top;

		cardEl.style.transition = 'none';
		cardEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
		cardEl.getBoundingClientRect();

		cardEl.style.transition = 'transform 0.3s ease-out';
		cardEl.style.transform = 'translate(0, 0)';

		cardEl.addEventListener('transitionend', () => {
			cardEl.style.transition = '';
			resolve();
		}, { once: true });
	});
}

// Helper to remove a single placeholder (when collapsing the empty space left in hand after playing a card)
export function animateShiftAndCloseGap(rowElement: HTMLElement, placeholder: HTMLElement): Promise<void> {
	return animateCollapsePlaceholders(rowElement, [placeholder]);
}

// Removes one or more placeholders from a row.
export function animateCollapsePlaceholders(rowElement: HTMLElement, placeholders: HTMLElement[]): Promise<void> {
	return new Promise((resolve) => {
		const siblingCards = Array.from(rowElement.querySelectorAll<HTMLElement>('.card'));

		// record first positions before removing placeholders
		const firstPositions = siblingCards.map((card) => ({
			el: card,
			rect: card.getBoundingClientRect(),
		}));

		// remove all placeholders from DOM at the same time
		placeholders.forEach((p) => p.remove());

		// recalculate overlaps/margins
		updateRowOverlaps();

		if (siblingCards.length === 0) {
			resolve();
			return;
		}

		// figure out what cards need to move and by how much
		const toAnimate = firstPositions
			.map(({ el, rect: firstRect }) => {
				const lastRect = el.getBoundingClientRect();
				const deltaX = firstRect.left - lastRect.left;
				return { el, deltaX };
			})
			.filter(({ deltaX }) => Math.abs(deltaX) > 1);

		if (toAnimate.length === 0) {
			resolve();
			return;
		}

		let animatedCount = 0;
		toAnimate.forEach(({ el, deltaX }) => {
			el.style.transition = 'none';
			el.style.transform = `translateX(${deltaX}px)`;

			el.getBoundingClientRect();

			el.style.transition = 'transform 0.25s';
			el.style.transform = 'translateX(0)';

			el.addEventListener('transitionend', () => {
				el.style.transition = '';
				animatedCount++;
				if (animatedCount === toAnimate.length) resolve();
			}, { once: true });
		});
	});
}

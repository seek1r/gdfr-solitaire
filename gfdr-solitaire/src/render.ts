import { Card } from './card';

export type SourceZone = 'hand1' | 'hand2' | 'field';
export type CardClickHandler = (card: Card, cardEl: HTMLElement, sourceZone: SourceZone) => void;

// === Dynamic Card Title Resize === //
export function fitCardTitles(containerElement: HTMLElement = document.body): void {
	const run = () => {
		const titleContainers = containerElement.querySelectorAll<HTMLElement>('.card-title-container');

		titleContainers.forEach((container) => {
			const title = container.querySelector<HTMLElement>('.card-title');
			if (!title) return;

			// reset scale to measure true width
			title.style.transform = 'none';

			const containerWidth = container.clientWidth;
			const titleWidth = title.scrollWidth;

			// if text exceeds container width, scale it down proportionally.
			// a small safety margin keeps text from touching the edge of the frame.
			if (titleWidth > containerWidth) {
				const scaleFactor = (containerWidth / titleWidth) * 0.96;
				title.style.transform = `scale(${scaleFactor})`;
			}
		});
	};

	if (document.fonts && document.fonts.status !== 'loaded') {
		document.fonts.ready.then(run);
	} else {
		run();
	}
	// Always run once immediately too, so layout isn't blank while fonts load,
	// then correct itself once `document.fonts.ready` resolves.
	run();
}

function renderStarGrid(starAssetPath: string = '/assets/star.png'): string {
	return `
    <div class="star-grid">
      <img class="star-icon star-1" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-2" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-3" src="${starAssetPath}" alt="star" />

      <img class="star-icon star-4" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-5" src="${starAssetPath}" alt="star" />

      <img class="star-icon star-6" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-7" src="${starAssetPath}" alt="star" />

      <img class="star-icon star-8" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-9" src="${starAssetPath}" alt="star" />

      <img class="star-icon star-10" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-11" src="${starAssetPath}" alt="star" />
      <img class="star-icon star-12" src="${starAssetPath}" alt="star" />
    </div>
  `;
}

export function createCardElement(card: Card, sourceZone: SourceZone, onClick: CardClickHandler): HTMLDivElement {
	const cardEl = document.createElement('div');
	cardEl.className = `card ${card.isFairy === true ? 'show-fairy' : ''}`;
	cardEl.dataset.id = card.id;
	const goblinFace = card.goblinFace;
	const fairyFace = card.fairyFace;

	cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-face face-goblin">
          <div class="card-border-frame ${goblinFace.isStar ? 'is-star' : ''}"
               style="background-image: url('${goblinFace.getBgImagePath()}')">

            ${goblinFace.isStar ? renderStarGrid() : ''}

            <div class="card-title-container">
              <span class="card-title">${goblinFace.name}</span>
            </div>
            <img class="card-suit-icon" src="${goblinFace.getSymbolAssetPath()}" alt="${goblinFace.symbol}" />
          </div>
        </div>

        <div class="card-face face-fairy">
          <div class="card-border-frame ${fairyFace.isStar ? 'is-star' : ''}"
               style="background-image: url('${fairyFace.getBgImagePath()}')">

            ${fairyFace.isStar ? renderStarGrid() : ''}

            <div class="card-title-container">
              <span class="card-title">${fairyFace.name}</span>
            </div>
            <img class="card-suit-icon" src="${fairyFace.getSymbolAssetPath()}" alt="${fairyFace.symbol}" />
          </div>
        </div>
      </div>
    `;

	cardEl.addEventListener('click', () => onClick(card, cardEl, sourceZone));

	return cardEl;
}

export interface BoardState {
	fieldCards: Card[];
	handRow1: Card[];
	handRow2: Card[];
}

export interface BoardContainers {
	field: HTMLElement;
	hand1: HTMLElement;
	hand2: HTMLElement;
}

export function renderBoard(state: BoardState, containers: BoardContainers, onCardClick: CardClickHandler): void {
	containers.field.innerHTML = '';
	containers.hand1.innerHTML = '';
	containers.hand2.innerHTML = '';

	state.fieldCards.forEach((card) => {
		containers.field.appendChild(createCardElement(card, 'field', onCardClick));
	});

	state.handRow1.forEach((card) => {
		containers.hand1.appendChild(createCardElement(card, 'hand1', onCardClick));
	});

	state.handRow2.forEach((card) => {
		containers.hand2.appendChild(createCardElement(card, 'hand2', onCardClick));
	});

	fitCardTitles();
	updateRowOverlaps();
}

// === Update Row Overlaps === //
export function updateRowOverlaps(): void {
	const rows = document.querySelectorAll<HTMLElement>('.card-row');

	rows.forEach((row) => {
		const cards = Array.from(row.querySelectorAll<HTMLElement>('.card'));
		// Placeholders take up real layout space while a move is in flight, so they
		// must be counted as slots too — otherwise the overlap math undercounts the
		// row's true content width and pushes real cards outside the row's bounds.
		const slots = Array.from(row.querySelectorAll<HTMLElement>('.card, .card-placeholder'));
		if (slots.length === 0) return;

		// INVERT Z-INDEX: Higher z-index on the left so left cards sit ON TOP of right cards.
		const totalCards = cards.length;
		cards.forEach((card, index) => {
			card.style.zIndex = `${totalCards - index}`;
		});

		if (slots.length === 1) {
			slots[0].style.marginRight = '0px';
			return;
		}

		// Cards are sized responsively (see --card-h in style.css), so their width
		// can't be hardcoded — measure the actual rendered width instead.
		const cardWidth = slots[0].getBoundingClientRect().width;
		const defaultGap = 15; // Natural gap between cards

		// Calculate usable row width
		const computedStyle = window.getComputedStyle(row);
		const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
		const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
		const availableWidth = row.clientWidth - paddingLeft - paddingRight;

		// Total width if laid out with natural gap
		const naturalTotalWidth = slots.length * cardWidth + (slots.length - 1) * defaultGap;

		if (naturalTotalWidth <= availableWidth) {
			// Natural spacing mode
			slots.forEach((slot, index) => {
				slot.style.marginRight = index === slots.length - 1 ? '0px' : `${defaultGap}px`;
			});
		} else {
			// Overlap mode: smooth dynamic negative margin
			const overflowAmount = naturalTotalWidth - availableWidth;
			const extraOverlapNeeded = overflowAmount / (slots.length - 1);
			const calculatedMargin = defaultGap - extraOverlapNeeded;

			slots.forEach((slot, index) => {
				slot.style.marginRight = index === slots.length - 1 ? '0px' : `${calculatedMargin}px`;
			});
		}
	});
}

// Ensure overlaps re-calculate if the window is resized
window.addEventListener('resize', () => {
	updateRowOverlaps();
	fitCardTitles();
});

import { type DealSize, type GameMode, type GameOptions, DEFAULT_OPTIONS } from './game';

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
	normal: 'Win by clearing every goblin card out of your hand.',
	challenge: 'Win by flipping every card in play — hand and field — to its fairy side.',
};

let currentOptions: GameOptions = { ...DEFAULT_OPTIONS };

function el<T extends HTMLElement>(id: string): T {
	return document.getElementById(id) as T;
}

// === Menu Configuration === //
export function initMenu(onStart: (options: GameOptions) => void): void {
	const modeDescriptionEl = el<HTMLParagraphElement>('mode-description');
	modeDescriptionEl.textContent = MODE_DESCRIPTIONS[currentOptions.mode];

	document.querySelectorAll<HTMLElement>('.option-buttons').forEach((group) => {
		const optionKey = group.dataset.option as 'dealSize' | 'mode';

		group.querySelectorAll<HTMLButtonElement>('button').forEach((btn) => {
			btn.addEventListener('click', () => {
				group.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
				btn.classList.add('selected');

				const value = btn.dataset.value!;
				if (optionKey === 'dealSize') {
					currentOptions.dealSize = Number(value) as DealSize;
				} else {
					currentOptions.mode = value as GameMode;
					modeDescriptionEl.textContent = MODE_DESCRIPTIONS[currentOptions.mode];
				}
			});
		});
	});

	el<HTMLButtonElement>('start-game-btn').addEventListener('click', () => {
		onStart({ ...currentOptions });
	});
}

export function getCurrentOptions(): GameOptions {
	return { ...currentOptions };
}

export function showScreen(screenId: 'menu-screen' | 'game-screen'): void {
	el('menu-screen').classList.toggle('hidden', screenId !== 'menu-screen');
	el('game-screen').classList.toggle('hidden', screenId !== 'game-screen');
}

// === Setup Confirmation Popup (on game reset) === //
export function showConfirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const modal = el('confirm-modal');
		const messageEl = el<HTMLParagraphElement>('confirm-message');
		const okBtn = el<HTMLButtonElement>('confirm-ok-btn');
		const cancelBtn = el<HTMLButtonElement>('confirm-cancel-btn');

		messageEl.textContent = message;
		modal.classList.remove('hidden');

		const cleanup = (result: boolean) => {
			modal.classList.add('hidden');
			okBtn.removeEventListener('click', onOk);
			cancelBtn.removeEventListener('click', onCancel);
			resolve(result);
		};
		const onOk = () => cleanup(true);
		const onCancel = () => cleanup(false);

		okBtn.addEventListener('click', onOk);
		cancelBtn.addEventListener('click', onCancel);
	});
}

// === Win Modal === //
export function showWinModal(message: string, onPlayAgain: () => void, onReturnMenu: () => void): void {
	const modal = el('win-modal');
	const messageEl = el<HTMLHeadingElement>('win-message');
	const playAgainBtn = el<HTMLButtonElement>('win-play-again-btn');
	const returnMenuBtn = el<HTMLButtonElement>('win-return-menu-btn');

	messageEl.textContent = message;
	modal.classList.remove('hidden');

	const cleanup = () => {
		modal.classList.add('hidden');
		playAgainBtn.removeEventListener('click', onPlayAgainClick);
		returnMenuBtn.removeEventListener('click', onReturnMenuClick);
	};
	const onPlayAgainClick = () => { cleanup(); onPlayAgain(); };
	const onReturnMenuClick = () => { cleanup(); onReturnMenu(); };

	playAgainBtn.addEventListener('click', onPlayAgainClick);
	returnMenuBtn.addEventListener('click', onReturnMenuClick);
}

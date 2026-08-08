/**
 * External dependencies
 */
import { createPortal, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf, _n } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	useChangeSummary,
	type ChangeSummary,
	type ChangeSummaryCopyChange,
	type ChangeSummaryStructuralChange,
} from './hooks/use-change-summary';
import { useApplyUpdate, type ApplyChoice } from './hooks/use-apply-update';

interface Props {
	postId: number | null;
	emailTitle: string;
	isOpen: boolean;
	onOpenChange: ( open: boolean ) => void;
}

type ChoiceMap = Record< string, 'keep_yours' | 'use_core' >;
type AutoTag = 'apply_core' | 'keep_yours';

/** Stable string key for a path array, used as the choice-map key. */
function pathKey( path: Array< number | string > ): string {
	return JSON.stringify( path );
}

/** Decorative leading dot for section headings (color-coded). */
const SectionDot = ( { tone }: { tone: 'warning' | 'brand' } ) => (
	<span
		aria-hidden="true"
		className={ `poocommerce-review-drawer__dot poocommerce-review-drawer__dot--${ tone }` }
	/>
);

/**
 * Per-conflict choice card. Two cards live side-by-side in a 2-column
 * grid; selecting one toggles the merchant's decision for that block.
 * The label + hint sublabel comes from the design handoff —
 * `ToggleGroupControl` only fits a single label, so we keep bespoke
 * buttons with `role="radio"` for the same a11y semantics.
 */
const ChoiceCard = ( {
	label,
	hint,
	active,
	onClick,
}: {
	label: string;
	hint: string;
	active: boolean;
	onClick: () => void;
} ) => (
	<button
		type="button"
		role="radio"
		aria-checked={ active }
		onClick={ onClick }
		className={ [
			'poocommerce-review-drawer__choice-card',
			active && 'is-active',
		]
			.filter( Boolean )
			.join( ' ' ) }
	>
		<span className="poocommerce-review-drawer__choice-label">
			{ label }
		</span>
		<span className="poocommerce-review-drawer__choice-hint">{ hint }</span>
	</button>
);

const ConflictsGroup = ( {
	conflicts,
	choices,
	onChoose,
}: {
	conflicts: ChangeSummaryCopyChange[];
	choices: ChoiceMap;
	onChoose: (
		path: Array< number | string >,
		decision: 'keep_yours' | 'use_core'
	) => void;
} ) => {
	if ( conflicts.length === 0 ) {
		return null;
	}

	const heading = sprintf(
		/* translators: %d: number of conflicts. */
		_n(
			'Needs your attention · %d conflict',
			'Needs your attention · %d conflicts',
			conflicts.length,
			'poocommerce'
		),
		conflicts.length
	);

	return (
		<section
			className="poocommerce-review-drawer__group"
			aria-labelledby="poocommerce-review-drawer-conflicts-heading"
		>
			<h3
				id="poocommerce-review-drawer-conflicts-heading"
				className="poocommerce-review-drawer__group-h"
			>
				<SectionDot tone="warning" />
				{ heading }
			</h3>
			{ conflicts.map( ( conflict ) => {
				const key = pathKey( conflict.path );
				const decision = choices[ key ] ?? 'keep_yours';
				const blockTitle =
					conflict.total > 1
						? sprintf(
								/* translators: 1: block name; 2: occurrence; 3: total. */
								__( '%1$s %2$d of %3$d', 'poocommerce' ),
								conflict.block,
								conflict.occurrence,
								conflict.total
						  )
						: conflict.block;

				return (
					<div
						key={ key }
						className="poocommerce-review-drawer__item"
					>
						<div className="poocommerce-review-drawer__item-h">
							<h4 className="poocommerce-review-drawer__item-title">
								{ blockTitle }
							</h4>
							<span className="poocommerce-review-drawer__tag poocommerce-review-drawer__tag--conflict">
								{ __( 'Conflict', 'poocommerce' ) }
							</span>
						</div>
						<p className="poocommerce-review-drawer__item-sub">
							{ __(
								'Core changed this text. Pick which version to keep.',
								'poocommerce'
							) }
						</p>
						<div
							className="poocommerce-review-drawer__diff"
							role="group"
							aria-label={ __( 'Diff', 'poocommerce' ) }
						>
							<div className="poocommerce-review-drawer__diff-row poocommerce-review-drawer__diff-row--minus">
								{ conflict.before }
							</div>
							<div className="poocommerce-review-drawer__diff-row poocommerce-review-drawer__diff-row--plus">
								{ conflict.after }
							</div>
						</div>
						<div
							className="poocommerce-review-drawer__choice"
							role="radiogroup"
							aria-label={ __(
								'Choose which version to apply',
								'poocommerce'
							) }
						>
							<ChoiceCard
								label={ __( 'Keep yours', 'poocommerce' ) }
								hint={ __( 'Default · safe', 'poocommerce' ) }
								active={ decision === 'keep_yours' }
								onClick={ () =>
									onChoose( conflict.path, 'keep_yours' )
								}
							/>
							<ChoiceCard
								label={ __( 'Use core', 'poocommerce' ) }
								hint={ __(
									'Discard your edit',
									'poocommerce'
								) }
								active={ decision === 'use_core' }
								onClick={ () =>
									onChoose( conflict.path, 'use_core' )
								}
							/>
						</div>
					</div>
				);
			} ) }
		</section>
	);
};

const AutoResolvedItem = ( {
	title,
	sub,
	tag,
}: {
	title: string;
	sub: string;
	tag: AutoTag;
} ) => (
	<div className="poocommerce-review-drawer__item">
		<div className="poocommerce-review-drawer__item-h">
			<h4 className="poocommerce-review-drawer__item-title">{ title }</h4>
			<span
				className={ [
					'poocommerce-review-drawer__tag',
					`poocommerce-review-drawer__tag--${
						tag === 'apply_core' ? 'apply-core' : 'keep-yours'
					}`,
				].join( ' ' ) }
			>
				{ tag === 'apply_core'
					? __( 'Apply core', 'poocommerce' )
					: __( 'Keep yours', 'poocommerce' ) }
			</span>
		</div>
		<p className="poocommerce-review-drawer__item-sub">{ sub }</p>
	</div>
);

const AutoResolvedGroup = ( {
	summary,
	autoResolvedCopyChanges,
}: {
	summary: ChangeSummary;
	autoResolvedCopyChanges: ChangeSummaryCopyChange[];
} ) => {
	const total =
		summary.added_blocks.length +
		summary.removed_blocks.length +
		summary.structural_changes.length +
		autoResolvedCopyChanges.length;

	if ( total === 0 ) {
		return null;
	}

	const heading = sprintf(
		/* translators: %d: number of auto-resolved blocks. */
		_n(
			'Auto-resolved · %d block',
			'Auto-resolved · %d blocks',
			total,
			'poocommerce'
		),
		total
	);

	return (
		<section
			className="poocommerce-review-drawer__group"
			aria-labelledby="poocommerce-review-drawer-auto-heading"
		>
			<h3
				id="poocommerce-review-drawer-auto-heading"
				className="poocommerce-review-drawer__group-h"
			>
				<SectionDot tone="brand" />
				{ heading }
			</h3>

			{ autoResolvedCopyChanges.map( ( entry ) => {
				const title =
					entry.total > 1
						? sprintf(
								/* translators: 1: block name; 2: occurrence; 3: total. */
								__( '%1$s %2$d of %3$d', 'poocommerce' ),
								entry.block,
								entry.occurrence,
								entry.total
						  )
						: entry.block;
				return (
					<AutoResolvedItem
						key={ `copy-${ pathKey( entry.path ) }-${
							entry.occurrence ?? 0
						}` }
						title={ title }
						sub={ __(
							'Core updated this text. Your version was unchanged, so the update will apply.',
							'poocommerce'
						) }
						tag="apply_core"
					/>
				);
			} ) }
			{ summary.added_blocks.map( ( entry ) => (
				<AutoResolvedItem
					key={ `added-${ pathKey( entry.path ) }` }
					title={ entry.label }
					sub={ __(
						'Added by core. Will appear in your email.',
						'poocommerce'
					) }
					tag="apply_core"
				/>
			) ) }
			{ summary.removed_blocks.map( ( entry ) => (
				<AutoResolvedItem
					key={ `removed-${ pathKey( entry.path ) }` }
					title={ entry.label }
					sub={ __(
						'Not in core. Your block is preserved.',
						'poocommerce'
					) }
					tag="keep_yours"
				/>
			) ) }
			{ summary.structural_changes.map(
				( change: ChangeSummaryStructuralChange, idx: number ) => (
					<AutoResolvedItem
						key={ `structural-${ idx }` }
						title={ change.description }
						sub={ __(
							'Structural change applied automatically.',
							'poocommerce'
						) }
						tag="apply_core"
					/>
				)
			) }
		</section>
	);
};

/**
 * Review drawer — surfaces the change-summary diff and lets the merchant
 * pick per-conflict "Keep yours / Use core" choices, then commits via the
 * /apply endpoint.
 *
 * Hand-rolled drawer (right-side, 480px, scrim, slide animation, focus
 * trap, Escape close) rendered via `createPortal` to `document.body` so
 * the fixed-position panel isn't trapped inside the `display: none`
 * `<PluginArea scope="poocommerce-email-editor">` wrapper. The choice
 * picker is the bespoke `ChoiceCard` two-up grid (the design's two-line
 * label + hint doesn't fit `ToggleGroupControl`'s single-label API);
 * tag pills and typography are plain `<span>` / `<h*>` / `<p>` styled
 * via SCSS.
 */
export const ReviewDrawer = ( {
	postId,
	emailTitle,
	isOpen,
	onOpenChange,
}: Props ) => {
	const drawerRef = useRef< HTMLDivElement >( null );
	const previousFocusRef = useRef< HTMLElement | null >( null );

	const [ choices, setChoices ] = useState< ChoiceMap >( {} );
	const { summary, isLoading, error } = useChangeSummary( postId, isOpen );
	const { apply, isApplying } = useApplyUpdate( postId );

	// Reset choices whenever a new diff is loaded.
	useEffect( () => {
		if ( summary ) {
			setChoices( {} );
		}
	}, [ summary ] );

	// Focus management — save the previously focused element on open,
	// move focus into the panel, restore on close.
	useEffect( () => {
		let rafId1: number;
		let rafId2: number;
		if ( isOpen ) {
			const drawerElement = drawerRef.current;
			if ( drawerElement ) {
				previousFocusRef.current = drawerElement.ownerDocument
					.activeElement as HTMLElement;
				rafId1 = requestAnimationFrame( () => {
					rafId2 = requestAnimationFrame( () => {
						drawerElement.focus();
					} );
				} );
			}
		} else if ( previousFocusRef.current?.isConnected ) {
			previousFocusRef.current.focus();
		}
		return () => {
			cancelAnimationFrame( rafId1 );
			cancelAnimationFrame( rafId2 );
		};
	}, [ isOpen ] );

	// Escape closes; Tab/Shift+Tab traps inside the drawer.
	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! isOpen ) {
				return;
			}
			if ( event.key === 'Escape' ) {
				onOpenChange( false );
				return;
			}
			if ( event.key === 'Tab' ) {
				const drawerElement = drawerRef.current;
				if ( ! drawerElement ) {
					return;
				}
				const focusable = drawerElement.querySelectorAll(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
				);
				if ( focusable.length === 0 ) {
					return;
				}
				const first = focusable[ 0 ] as HTMLElement;
				const last = focusable[ focusable.length - 1 ] as HTMLElement;
				const active = drawerElement.ownerDocument
					.activeElement as HTMLElement;
				if ( event.shiftKey ) {
					if ( active === first || active === drawerElement ) {
						event.preventDefault();
						last?.focus();
					}
				} else if ( active === last ) {
					event.preventDefault();
					first?.focus();
				}
			}
		};
		if ( isOpen ) {
			document.addEventListener( 'keydown', handleKeyDown );
		}
		return () => {
			document.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ isOpen, onOpenChange ] );

	const setChoice = (
		path: Array< number | string >,
		decision: 'keep_yours' | 'use_core'
	) => {
		setChoices( ( prev ) => ( {
			...prev,
			[ pathKey( path ) ]: decision,
		} ) );
	};

	const handleApply = async () => {
		const choiceList: ApplyChoice[] = Object.entries( choices ).map(
			( [ key, decision ] ) => ( {
				path: JSON.parse( key ) as Array< number | string >,
				decision,
			} )
		);
		const res = await apply( choiceList );
		if ( res ) {
			onOpenChange( false );
		}
	};

	const totalChanges = summary
		? summary.copy_changes.length +
		  summary.added_blocks.length +
		  summary.removed_blocks.length +
		  summary.structural_changes.length
		: 0;

	const subtitle = sprintf(
		/* translators: 1: email name; 2: PooCommerce version; 3: number of changes. */
		_n(
			'%1$s · PooCommerce %2$s · %3$d change',
			'%1$s · PooCommerce %2$s · %3$d changes',
			totalChanges,
			'poocommerce'
		),
		emailTitle,
		summary?.version_to ?? '',
		totalChanges
	);

	const applyLabel = sprintf(
		/* translators: %d: total number of changes that will be applied. */
		__( 'Apply (%d)', 'poocommerce' ),
		totalChanges
	);

	const applyDisabled =
		isApplying ||
		isLoading ||
		! summary ||
		summary.is_fallback ||
		totalChanges === 0;

	return createPortal(
		<>
			<div
				className="poocommerce-review-drawer__overlay"
				onClick={ () => onOpenChange( false ) }
				role="presentation"
				style={ { display: isOpen ? 'block' : 'none' } }
				aria-hidden={ ! isOpen }
			/>
			<div className="poocommerce-review-drawer">
				<aside
					ref={ drawerRef }
					className={ [
						'poocommerce-review-drawer__panel',
						isOpen ? 'is-open' : 'is-closed',
					].join( ' ' ) }
					role="dialog"
					aria-modal="true"
					aria-labelledby="poocommerce-review-drawer-title"
					aria-hidden={ ! isOpen }
					tabIndex={ -1 }
				>
					<header className="poocommerce-review-drawer__header">
						<div className="poocommerce-review-drawer__h-stack">
							<h2
								id="poocommerce-review-drawer-title"
								className="poocommerce-review-drawer__title"
							>
								{ __(
									'Review template update',
									'poocommerce'
								) }
							</h2>
							<p className="poocommerce-review-drawer__subtitle">
								{ subtitle }
							</p>
						</div>
						<Button
							icon={ closeSmall }
							label={ __( 'Close', 'poocommerce' ) }
							onClick={ () => onOpenChange( false ) }
							className="poocommerce-review-drawer__close"
						/>
					</header>

					<div className="poocommerce-review-drawer__body">
						{ isLoading && (
							<div
								role="status"
								aria-live="polite"
								aria-label={ __(
									'Loading diff',
									'poocommerce'
								) }
								className="poocommerce-review-drawer__status"
							>
								<Spinner />
							</div>
						) }

						{ error && (
							<div
								role="alert"
								className="poocommerce-review-drawer__status"
							>
								{ __(
									'Could not load the change summary.',
									'poocommerce'
								) }
							</div>
						) }

						{ summary && summary.is_fallback && (
							<div className="poocommerce-review-drawer__status">
								{ summary.summary_lines[ 0 ] ??
									__(
										'Template updated — see release notes.',
										'poocommerce'
									) }
							</div>
						) }

						{ summary && ! summary.is_fallback && (
							<>
								<ConflictsGroup
									conflicts={ summary.copy_changes.filter(
										( cc ) => ! cc.auto_resolvable
									) }
									choices={ choices }
									onChoose={ setChoice }
								/>
								<AutoResolvedGroup
									summary={ summary }
									autoResolvedCopyChanges={ summary.copy_changes.filter(
										( cc ) => cc.auto_resolvable === true
									) }
								/>
							</>
						) }
					</div>

					<footer className="poocommerce-review-drawer__footer">
						<p className="poocommerce-review-drawer__foot-note">
							{ __(
								'Revision recorded for rollback.',
								'poocommerce'
							) }
						</p>
						<div className="poocommerce-review-drawer__footer-actions">
							<Button
								variant="tertiary"
								onClick={ () => onOpenChange( false ) }
								disabled={ isApplying }
								__next40pxDefaultSize
							>
								{ __( 'Cancel', 'poocommerce' ) }
							</Button>
							<Button
								variant="primary"
								onClick={ () => {
									void handleApply();
								} }
								disabled={ applyDisabled }
								isBusy={ isApplying }
								__next40pxDefaultSize
							>
								{ applyLabel }
							</Button>
						</div>
					</footer>
				</aside>
			</div>
		</>,
		document.body
	);
};

/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { plus, next, previous } from '@wordpress/icons';
import {
	createElement,
	useRef,
	useCallback,
	useContext,
	useState,
	Fragment,
	useEffect,
} from '@wordpress/element';
import clsx from 'clsx';
import { MouseEvent } from 'react';
import { Button, Popover, ToolbarItem } from '@wordpress/components';
import PinnedItems from '@wordpress/interface/build-module/components/pinned-items';
// eslint-disable-next-line @poocommerce/dependency-group
import {
	store as preferencesStore,
	/* @ts-expect-error missing types. */
} from '@wordpress/preferences';
// eslint-disable-next-line @poocommerce/dependency-group
import {
	NavigableToolbar,
	store as blockEditorStore,
	// @ts-expect-error ToolSelector exists in WordPress components.
	ToolSelector,
	BlockToolbar,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { EditorContext } from '../context';
import EditorHistoryRedo from './editor-history-redo';
import EditorHistoryUndo from './editor-history-undo';
import { DocumentOverview } from './document-overview';
import { MoreMenu } from './more-menu';
import { SIDEBAR_COMPLEMENTARY_AREA_SCOPE } from '../constants';

type HeaderToolbarProps = {
	onSave?: () => void;
	onCancel?: () => void;
};

export function HeaderToolbar( {
	onSave = () => {},
	onCancel = () => {},
}: HeaderToolbarProps ) {
	const { isInserterOpened, setIsInserterOpened } =
		useContext( EditorContext );
	const [ isBlockToolsCollapsed, setIsBlockToolsCollapsed ] =
		useState( true );
	const isLargeViewport = useViewportMatch( 'medium' );
	const inserterButton = useRef< HTMLButtonElement | null >( null );
	const {
		isInserterEnabled,
		isTextModeEnabled,
		hasBlockSelection,
		hasFixedToolbar,
	} = useSelect( ( select ) => {
		const {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore These selectors are available in the block data store.
			hasInserterItems,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore These selectors are available in the block data store.
			getBlockRootClientId,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore These selectors are available in the block data store.
			getBlockSelectionEnd,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore These selectors are available in the block data store.
			__unstableGetEditorMode: getEditorMode,
			// @ts-expect-error These selectors are available in the block data store.
			getBlockSelectionStart,
		} = select( blockEditorStore );
		const { get: getPreference } = select( preferencesStore );

		return {
			isTextModeEnabled: getEditorMode() === 'text',
			isInserterEnabled: hasInserterItems(
				getBlockRootClientId( getBlockSelectionEnd() ?? '' ) ??
					undefined
			),
			hasBlockSelection: !! getBlockSelectionStart(),
			hasFixedToolbar: getPreference( 'core', 'fixedToolbar' ),
		};
	}, [] );

	const toggleInserter = useCallback(
		() => setIsInserterOpened( ! isInserterOpened ),
		[ isInserterOpened, setIsInserterOpened ]
	);

	useEffect( () => {
		// If we have a new block selection, show the block tools
		if ( hasBlockSelection ) {
			setIsBlockToolsCollapsed( false );
		}
	}, [ hasBlockSelection ] );

	return (
		<div className="poocommerce-iframe-editor__header">
			<div className="poocommerce-iframe-editor__header-left">
				<NavigableToolbar
					className="poocommerce-iframe-editor-document-tools"
					aria-label={ __( 'Document tools', 'poocommerce' ) }
					// @ts-expect-error variant prop exists
					variant="unstyled"
				>
					<div className="poocommerce-iframe-editor-document-tools__left">
						<ToolbarItem
							ref={ inserterButton }
							as={ Button }
							className="poocommerce-iframe-editor__header-inserter-toggle"
							// @ts-expect-error the prop variant is passed to the Button component
							variant="primary"
							isPressed={ isInserterOpened }
							onMouseDown={ (
								event: MouseEvent< HTMLButtonElement >
							) => {
								event.preventDefault();
							} }
							onClick={ toggleInserter }
							disabled={ ! isInserterEnabled }
							icon={ plus }
							label={ __(
								'Toggle block inserter',
								'poocommerce'
							) }
							aria-expanded={ isInserterOpened }
							showTooltip
						/>
						{ isLargeViewport && (
							<ToolbarItem
								as={ ToolSelector }
								// @ts-expect-error the prop size is passed to the ToolSelector component
								disabled={ isTextModeEnabled }
								size="compact"
							/>
						) }
						{ /* @ts-expect-error the prop size is passed to the EditorHistoryUndo component */ }
						<ToolbarItem as={ EditorHistoryUndo } size="compact" />
						{ /* @ts-expect-error the prop size is passed to the EditorHistoryRedo component */ }
						<ToolbarItem as={ EditorHistoryRedo } size="compact" />
						{ /* @ts-expect-error the prop size is passed to the DocumentOverview component */ }
						<ToolbarItem as={ DocumentOverview } size="compact" />
					</div>
				</NavigableToolbar>
				{ hasFixedToolbar && isLargeViewport && (
					<>
						<div
							className={ clsx( 'selected-block-tools-wrapper', {
								'is-collapsed': isBlockToolsCollapsed,
							} ) }
						>
							{ /* @ts-expect-error missing type */ }
							<BlockToolbar hideDragHandle />
						</div>
						{ /* @ts-expect-error name does exist on PopoverSlot see: https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/popover/index.tsx#L555 */ }
						<Popover.Slot name="block-toolbar" />
						{ hasBlockSelection && (
							<Button
								className="edit-post-header__block-tools-toggle"
								icon={ isBlockToolsCollapsed ? next : previous }
								onClick={ () => {
									setIsBlockToolsCollapsed(
										( collapsed ) => ! collapsed
									);
								} }
								label={
									isBlockToolsCollapsed
										? __(
												'Show block tools',
												'poocommerce'
										  )
										: __(
												'Hide block tools',
												'poocommerce'
										  )
								}
							/>
						) }
					</>
				) }
			</div>
			<div className="poocommerce-iframe-editor__header-right">
				<Button
					variant="tertiary"
					className="poocommerce-modal-actions__cancel-button"
					onClick={ onCancel }
					text={ __( 'Cancel', 'poocommerce' ) }
				/>
				<Button
					variant="primary"
					className="poocommerce-modal-actions__done-button"
					onClick={ onSave }
					text={ __( 'Done', 'poocommerce' ) }
				/>
				<PinnedItems.Slot scope={ SIDEBAR_COMPLEMENTARY_AREA_SCOPE } />
				<MoreMenu />
			</div>
		</div>
	);
}

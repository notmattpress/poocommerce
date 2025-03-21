/**
 * External dependencies
 */
import {
	createElement,
	StrictMode,
	Fragment,
	useCallback,
	useState,
} from '@wordpress/element';
import {
	LayoutContextProvider,
	useExtendLayout,
} from '@poocommerce/admin-layout';
import { navigateTo, getNewPath, getQuery } from '@poocommerce/navigation';
import { useSelect } from '@wordpress/data';
import { Popover } from '@wordpress/components';
import InterfaceSkeleton from '@wordpress/interface/build-module/components/interface-skeleton';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @poocommerce/dependency-group
import { EntityProvider } from '@wordpress/core-data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet.
// eslint-disable-next-line @poocommerce/dependency-group
import { ShortcutProvider } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import { Header } from '../header';
import { BlockEditor } from '../block-editor';
import { EditorLoadingContext } from '../../contexts/editor-loading-context';
import { ValidationProvider } from '../../contexts/validation-context';
import { EditorProps } from './types';
import { wooProductEditorUiStore } from '../../store/product-editor-ui';
import { PrepublishPanel } from '../prepublish-panel/prepublish-panel';

export function Editor( { productId, postType = 'product' }: EditorProps ) {
	const [ isEditorLoading, setIsEditorLoading ] = useState( true );

	const query = getQuery() as Record< string, string >;
	const selectedTab = query.tab || null;

	const setSelectedTab = useCallback( ( tabId: string ) => {
		navigateTo( { url: getNewPath( { tab: tabId } ) } );
	}, [] );

	const updatedLayoutContext = useExtendLayout( 'product-block-editor' );

	// Check if the prepublish sidebar is open from the store.
	const isPrepublishPanelOpen = useSelect( ( select ) => {
		return select( wooProductEditorUiStore ).isPrepublishPanelOpen();
	}, [] );

	return (
		<LayoutContextProvider value={ updatedLayoutContext }>
			<StrictMode>
				<EntityProvider
					kind="postType"
					type={ postType }
					id={ productId }
				>
					<ShortcutProvider>
						<ValidationProvider
							postType={ postType }
							productId={ productId }
						>
							<EditorLoadingContext.Provider
								value={ isEditorLoading }
							>
								<InterfaceSkeleton
									header={
										<Header
											onTabSelect={ setSelectedTab }
											productType={ postType }
											selectedTab={ selectedTab }
										/>
									}
									content={
										<>
											<BlockEditor
												postType={ postType }
												productId={ productId }
												context={ {
													selectedTab,
													postType,
													postId: productId,
												} }
												setIsEditorLoading={
													setIsEditorLoading
												}
											/>
										</>
									}
									actions={
										isPrepublishPanelOpen && (
											<PrepublishPanel
												productType={ postType }
											/>
										)
									}
								/>
							</EditorLoadingContext.Provider>
							{ /* @ts-expect-error name does exist on PopoverSlot see: https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/popover/index.tsx#L555 */ }
							<Popover.Slot />
						</ValidationProvider>
					</ShortcutProvider>
				</EntityProvider>
			</StrictMode>
		</LayoutContextProvider>
	);
}

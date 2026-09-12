/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { addFilter, hasFilter } from '@wordpress/hooks';
import type { EditorBlock } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import Switcher from './switcher';
import { findParentBlockEditorViews } from './utils';

const withViewSwitcher =
	< T extends EditorBlock< T > >( BlockEdit: React.ElementType ) =>
	( props: Record< string, unknown > ) => {
		const { clientId } = props as { clientId: string };
		const { views, currentView, viewClientId } = useSelect( ( select ) => {
			const blockAttributes =
				select( 'core/block-editor' ).getBlockAttributes( clientId );

			return blockAttributes?.editorViews
				? {
						views: blockAttributes.editorViews,
						currentView: blockAttributes.currentView,
						viewClientId: clientId,
				  }
				: findParentBlockEditorViews( clientId );
		} );

		if ( views.length === 0 ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<Switcher
					currentView={ currentView }
					views={ views }
					clientId={ viewClientId }
				/>
				<BlockEdit { ...props } />
			</>
		);
	};

if ( ! hasFilter( 'editor.BlockEdit', 'poocommerce/with-view-switcher' ) ) {
	addFilter(
		'editor.BlockEdit',
		'poocommerce/with-view-switcher',
		withViewSwitcher,
		11
	);
}

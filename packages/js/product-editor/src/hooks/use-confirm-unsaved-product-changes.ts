/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useConfirmUnsavedChanges } from '@poocommerce/navigation';
import { useEntityId } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { preventLeavingProductForm } from '../utils/prevent-leaving-product-form';
import { useProductEdits } from './use-product-edits';

export function useConfirmUnsavedProductChanges(
	productType = <string>'product'
) {
	const productId = useEntityId( 'postType', productType );

	const { hasEdits } = useProductEdits( productType );
	const { isSaving } = useSelect(
		( select ) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const { isSavingEntityRecord } = select( 'core' );

			return {
				// @ts-expect-error Selector is not typed
				isSaving: isSavingEntityRecord(
					'postType',
					productType,
					productId
				),
			};
		},
		[ productId, productType ]
	);

	useConfirmUnsavedChanges(
		hasEdits || isSaving,
		preventLeavingProductForm( productId )
	);
}

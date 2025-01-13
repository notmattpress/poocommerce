/**
 * External dependencies
 */
import { OPTIONS_STORE_NAME } from '@poocommerce/data';
import { useSelect, useDispatch } from '@wordpress/data';

export const BLOCK_EDITOR_TOUR_SHOWN_OPTION =
	'poocommerce_block_product_tour_shown';

export const useBlockEditorTourOptions = () => {
	const { updateOptions } = useDispatch( OPTIONS_STORE_NAME );
	const { shouldTourBeShown } = useSelect( ( select ) => {
		const { getOption, hasFinishedResolution } =
			select( OPTIONS_STORE_NAME );

		const wasTourShown =
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
			getOption( BLOCK_EDITOR_TOUR_SHOWN_OPTION ) === 'yes' ||
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/poocommerce/poocommerce/pull/54146
			! hasFinishedResolution( 'getOption', [
				BLOCK_EDITOR_TOUR_SHOWN_OPTION,
			] );

		return {
			shouldTourBeShown: ! wasTourShown,
		};
	}, [] );

	const dismissModal = () => {
		updateOptions( {
			[ BLOCK_EDITOR_TOUR_SHOWN_OPTION ]: 'yes',
		} );
	};

	return {
		dismissModal,
		shouldTourBeShown,
	};
};

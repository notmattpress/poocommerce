/**
 * External dependencies
 */
import { noticeContexts } from '@poocommerce/base-context';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { useDispatch, useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@poocommerce/block-data';
import { ORDER_FORM_KEYS } from '@poocommerce/block-settings';
import { Form } from '@poocommerce/base-components/cart-checkout';
import type { FunctionComponent } from 'react';

const Block: FunctionComponent = () => {
	const { additionalFields } = useSelect( ( select ) => {
		const store = select( CHECKOUT_STORE_KEY );
		return {
			additionalFields: store.getAdditionalFields(),
		};
	} );

	const { setAdditionalFields } = useDispatch( CHECKOUT_STORE_KEY );

	const onChangeForm = ( additionalValues ) => {
		setAdditionalFields( additionalValues );
	};

	const additionalFieldValues = {
		...additionalFields,
	};

	if ( ORDER_FORM_KEYS.length === 0 ) {
		return null;
	}

	return (
		<>
			<StoreNoticesContainer
				context={ noticeContexts.ORDER_INFORMATION }
			/>
			<Form
				id="additional-information"
				addressType="additional-information"
				onChange={ onChangeForm }
				values={ additionalFieldValues }
				fields={ ORDER_FORM_KEYS }
			/>
		</>
	);
};

export default Block;

/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { AdditionalFieldsPlaceholder } from '@poocommerce/base-components/cart-checkout';
import { ADDRESS_FORM_FIELDS } from '@poocommerce/block-settings';

/**
 * Internal dependencies
 */
import './style.scss';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps( {
		className: 'wc-block-order-confirmation-shipping-address',
	} );

	return (
		<div { ...blockProps }>
			<address>
				Test address 1<br />
				Test address 2<br />
				San Francisco, CA 94110
				<br />
				United States
				<AdditionalFieldsPlaceholder
					additionalFields={ ADDRESS_FORM_FIELDS }
				/>
			</address>
		</div>
	);
};

export default Edit;

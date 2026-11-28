/**
 * External dependencies
 */
import { Fragment, useEffect } from '@wordpress/element';
import {
	useCheckoutAddress,
	useEditorContext,
	noticeContexts,
} from '@poocommerce/base-context';
import Noninteractive from '@poocommerce/base-components/noninteractive';
import { StoreNoticesContainer } from '@poocommerce/blocks-components';
import { ShippingAddress } from '@poocommerce/settings';

/**
 * Internal dependencies
 */
import CustomerAddress from './customer-address';

const Block = (): JSX.Element => {
	const {
		defaultFields,
		billingAddress,
		setShippingAddress,
		useBillingAsShipping,
	} = useCheckoutAddress();
	const { isEditor } = useEditorContext();

	// Syncs shipping address with billing address if "Force shipping to the customer billing address" is enabled.
	useEffect( () => {
		if ( useBillingAsShipping ) {
			const { email, ...addressValues } = billingAddress;
			const syncValues: Partial< ShippingAddress > = {
				...addressValues,
			};

			if ( defaultFields?.phone?.hidden ) {
				delete syncValues.phone;
			}

			if ( defaultFields?.company?.hidden ) {
				delete syncValues.company;
			}

			setShippingAddress( syncValues );
		}
		// The address should only be initialized on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const WrapperComponent = isEditor ? Noninteractive : Fragment;
	const noticeContext = useBillingAsShipping
		? [ noticeContexts.BILLING_ADDRESS, noticeContexts.SHIPPING_ADDRESS ]
		: [ noticeContexts.BILLING_ADDRESS ];

	return (
		<>
			<StoreNoticesContainer context={ noticeContext } />
			<WrapperComponent>
				<CustomerAddress />
			</WrapperComponent>
		</>
	);
};

export default Block;

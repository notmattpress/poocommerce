/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment, useEffect } from '@wordpress/element';
import {
	useCheckoutAddress,
	useEditorContext,
	noticeContexts,
} from '@poocommerce/base-context';
import {
	StoreNoticesContainer,
	CheckboxControl,
} from '@poocommerce/blocks-components';
import Noninteractive from '@poocommerce/base-components/noninteractive';
import type { BillingAddress } from '@poocommerce/settings';
import { getSetting } from '@poocommerce/settings';
import { emptyAddressFields } from '@poocommerce/base-utils';
import { useToggleCollapse } from '@poocommerce/base-hooks';
import type { CartResponseBillingAddress } from '@poocommerce/types';

/**
 * Internal dependencies
 */
import CustomerAddress from './customer-address';

const Block = (): JSX.Element => {
	const {
		defaultFields,
		setBillingAddress,
		shippingAddress,
		billingAddress,
		useShippingAsBilling,
		setUseShippingAsBilling,
		setEditingBillingAddress,
	} = useCheckoutAddress();
	const { isEditor } = useEditorContext();
	const isGuest = getSetting( 'currentUserId' ) === 0;

	// Syncs the billing address with the shipping address.
	const syncBillingWithShipping = () => {
		const syncValues: Partial< BillingAddress > = {
			...shippingAddress,
		};

		if ( defaultFields?.phone?.hidden ) {
			delete syncValues.phone;
		}

		if ( defaultFields?.company?.hidden ) {
			delete syncValues.company;
		}

		// Only sync if any values are different
		const needsSync =
			Object.keys( syncValues ).length !==
				Object.keys( billingAddress ).length ||
			! Object.keys( syncValues ).every(
				( key ) =>
					syncValues[ key as keyof BillingAddress ] ===
					billingAddress[ key as keyof BillingAddress ]
			);

		if ( needsSync ) {
			setBillingAddress( syncValues );
		}
	};

	const clearBillingAddress = ( address: BillingAddress ) => {
		// If the address is empty or the user is not a guest,
		// we don't need to clear the address.
		if ( ! address || ! isGuest ) {
			return;
		}
		const emptyAddress = emptyAddressFields(
			address as CartResponseBillingAddress
		);
		setBillingAddress( emptyAddress );
	};

	// Run this on first render to ensure addresses sync if needed (this is not re-ran when toggling the checkbox).
	useEffect( () => {
		if ( useShippingAsBilling ) {
			syncBillingWithShipping();
		}
		// The address should only be initialized on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// The checkbox collapses the billing section out and grows it in.
	const billingCollapse = useToggleCollapse( ! useShippingAsBilling, () =>
		document.getElementById( 'billing-fields' )
	);

	const WrapperComponent = isEditor ? Noninteractive : Fragment;
	const noticeContext = useShippingAsBilling
		? [ noticeContexts.SHIPPING_ADDRESS, noticeContexts.BILLING_ADDRESS ]
		: [ noticeContexts.SHIPPING_ADDRESS ];

	return (
		<>
			<StoreNoticesContainer context={ noticeContext } />
			<WrapperComponent>
				<CustomerAddress />
			</WrapperComponent>
			<CheckboxControl
				ref={ billingCollapse.triggerRef }
				className="wc-block-checkout__use-address-for-billing"
				label={ __( 'Use same address for billing', 'poocommerce' ) }
				checked={ useShippingAsBilling }
				onChange={ ( checked: boolean ) => {
					billingCollapse.onToggle();
					setUseShippingAsBilling( checked );
					if ( checked ) {
						syncBillingWithShipping();
					} else {
						setEditingBillingAddress( true );
						clearBillingAddress( billingAddress );
					}
				} }
			/>
		</>
	);
};

export default Block;

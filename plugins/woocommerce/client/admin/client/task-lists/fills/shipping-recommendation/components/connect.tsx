/**
 * External dependencies
 */
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { default as ConnectForm } from '~/dashboard/components/connect';

type ConnectProps = {
	onConnect?: () => void;
};

export const Connect = ( { onConnect }: ConnectProps ) => {
	return (
		// @ts-expect-error TODO: convert ConnectForm to TypeScript
		<ConnectForm
			from="poocommerce-shipping"
			onConnect={ () => {
				recordEvent( 'tasklist_shipping_recommendation_connect_store', {
					connect: true,
				} );
				onConnect?.();
			} }
		/>
	);
};

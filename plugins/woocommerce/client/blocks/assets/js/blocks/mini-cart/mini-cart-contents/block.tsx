/**
 * External dependencies
 */
import { DrawerCloseButton } from '@poocommerce/base-components/drawer';
import { CartEventsProvider } from '@poocommerce/base-context';

/**
 * Internal dependencies
 */
import './inner-blocks/register-components';

type MiniCartContentsBlockProps = {
	attributes: Record< string, unknown >;
	children: JSX.Element | JSX.Element[];
};

export const MiniCartContentsBlock = (
	props: MiniCartContentsBlockProps
): JSX.Element => {
	const { children } = props;

	return (
		<>
			<CartEventsProvider>
				<DrawerCloseButton />
				{ children }
			</CartEventsProvider>
		</>
	);
};

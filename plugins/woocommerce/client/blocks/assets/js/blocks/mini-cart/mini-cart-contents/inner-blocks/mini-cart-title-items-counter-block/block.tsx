/**
 * External dependencies
 */
import { useStoreCart } from '@poocommerce/base-context';
import clsx from 'clsx';
import { _n, sprintf } from '@wordpress/i18n';
import { useStyleProps } from '@poocommerce/base-hooks';

type Props = {
	className?: string;
};

const Block = ( props: Props ): JSX.Element => {
	const { cartItemsCount } = useStoreCart();
	const styleProps = useStyleProps( props );

	return (
		<span
			className={ clsx( props.className, styleProps.className ) }
			style={ styleProps.style }
		>
			{ sprintf(
				/* translators: %d is the count of items in the cart. */
				_n( '(%d item)', '(%d items)', cartItemsCount, 'poocommerce' ),
				cartItemsCount
			) }
		</span>
	);
};

export default Block;

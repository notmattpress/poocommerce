/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';
import { Button } from '@wordpress/components';

export type SaveDraftButtonProps = Omit<
	Button.ButtonProps,
	'aria-disabled' | 'variant' | 'children'
> & {
	productStatus: Product[ 'status' ];
	productType?: string;
	visibleTab?: string | null;
};

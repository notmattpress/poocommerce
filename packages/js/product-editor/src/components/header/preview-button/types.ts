/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';
import { Button } from '@wordpress/components';

export type PreviewButtonProps = Omit<
	Button.AnchorProps,
	'aria-disabled' | 'variant' | 'href' | 'children'
> & {
	productStatus: Product[ 'status' ];
	productType: string;
	visibleTab?: string | null;
};

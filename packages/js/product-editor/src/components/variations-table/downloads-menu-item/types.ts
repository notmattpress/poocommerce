/**
 * External dependencies
 */
import { ProductVariation } from '@poocommerce/data';

export type ShippingMenuItemProps = {
	variation: ProductVariation;
	handlePrompt(
		label?: string,
		parser?: ( value: string ) => Partial< ProductVariation > | null
	): void;
	onClose(): void;
};

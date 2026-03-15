/**
 * External dependencies
 */
import type { ProductVariation } from '@poocommerce/data';

export type VariationPricingFormProps = {
	initialValue?: Partial< ProductVariation >;
	onSubmit?(
		value: Pick< ProductVariation, 'regular_price' | 'sale_price' >
	): void;
	onCancel?(): void;
};

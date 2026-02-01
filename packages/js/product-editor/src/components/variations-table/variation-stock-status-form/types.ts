/**
 * External dependencies
 */
import { ProductVariation } from '@poocommerce/data';

export type VariationStockStatusFormProps = {
	initialValue?: Partial< ProductVariation >;
	onSubmit?(
		value: Pick<
			ProductVariation,
			'manage_stock' | 'stock_status' | 'stock_quantity'
		>
	): void;
	onCancel?(): void;
};

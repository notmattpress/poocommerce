/**
 * External dependencies
 */
import { PartialProductVariation, ProductVariation } from '@poocommerce/data';

export type VariationActionsMenuItemProps = {
	selection: ProductVariation[];
	onChange( values: PartialProductVariation[], showSuccess?: boolean ): void;
	onClose(): void;
	supportsMultipleSelection?: boolean;
};

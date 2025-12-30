/**
 * External dependencies
 */
import { Product } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { ExpressionsPanel } from './expressions-panel';
import { TabPanel } from './tab-panel';

export function ProductTabPanel( {
	isSelected,
	evaluationContext,
}: {
	isSelected: boolean;
	evaluationContext: {
		postType: string;
		editedProduct: Product;
	};
} ) {
	return (
		<TabPanel isSelected={ isSelected }>
			<div className="poocommerce-product-editor-dev-tools-product">
				<div className="poocommerce-product-editor-dev-tools-product-entity">
					{ JSON.stringify(
						evaluationContext.editedProduct,
						null,
						4
					) }
				</div>
				<ExpressionsPanel evaluationContext={ evaluationContext } />
			</div>
		</TabPanel>
	);
}

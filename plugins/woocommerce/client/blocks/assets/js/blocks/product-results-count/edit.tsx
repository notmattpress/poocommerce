/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export interface Attributes {
	className?: string;
}

const Edit = () => {
	const blockProps = useBlockProps( {
		className: 'poocommerce wc-block-product-results-count',
	} );

	return (
		<div { ...blockProps }>
			<p className="poocommerce-result-count">
				{ __( 'Showing 1-X of X results', 'poocommerce' ) }
			</p>
		</div>
	);
};

export default Edit;

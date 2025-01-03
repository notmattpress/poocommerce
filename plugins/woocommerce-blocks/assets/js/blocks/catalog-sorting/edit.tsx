/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const CatalogSorting = () => {
	return (
		<select className="orderby">
			<option>{ __( 'Default sorting', 'poocommerce' ) }</option>
		</select>
	);
};

const Edit = () => {
	const blockProps = useBlockProps( {
		className: 'poocommerce wc-block-catalog-sorting',
	} );

	return (
		<>
			<div { ...blockProps }>
				<Disabled>
					<CatalogSorting />
				</Disabled>
			</div>
		</>
	);
};

export default Edit;

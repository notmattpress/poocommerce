/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface Attributes {
	className?: string;
}

const Edit = () => {
	const blockProps = useBlockProps( {
		className: 'poocommerce wc-block-breadcrumbs',
	} );

	return (
		<div { ...blockProps }>
			<Disabled>
				<a href="/">{ __( 'Breadcrumbs', 'poocommerce' ) }</a>
				{ __( ' / Navigation / Path', 'poocommerce' ) }
			</Disabled>
		</div>
	);
};

export default Edit;

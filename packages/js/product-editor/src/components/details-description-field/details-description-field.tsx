/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	useFormContext,
	__experimentalRichTextEditor as RichTextEditor,
} from '@poocommerce/components';
import { Product } from '@poocommerce/data';
import { BlockInstance, serialize, parse } from '@wordpress/blocks';
import { useState, createElement } from '@wordpress/element';

export const DetailsDescriptionField = () => {
	const { setValue, values } = useFormContext< Product >();
	const [ descriptionBlocks, setDescriptionBlocks ] = useState<
		BlockInstance[]
	>( parse( values.description || '' ) );

	return (
		<RichTextEditor
			label={ __( 'Description', 'poocommerce' ) }
			blocks={ descriptionBlocks }
			onChange={ ( blocks ) => {
				setDescriptionBlocks( blocks );
				if ( ! descriptionBlocks.length ) {
					return;
				}
				setValue( 'description', serialize( blocks ) );
			} }
			placeholder={ __(
				'Describe this product. What makes it unique? What are its most important features?',
				'poocommerce'
			) }
		/>
	);
};

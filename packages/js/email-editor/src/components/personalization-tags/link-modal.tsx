/**
 * External dependencies
 */
import { Button, Modal, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

const LinkModal = ( { onInsert, isOpened, closeCallback, tag } ) => {
	const [ linkText, setLinkText ] = useState( __( 'Link', 'poocommerce' ) );
	if ( ! isOpened ) {
		return null;
	}

	return (
		<Modal
			size="small"
			title={ __( 'Insert Link', 'poocommerce' ) }
			onRequestClose={ closeCallback }
			className="poocommerce-personalization-tags-modal"
		>
			<TextControl
				label={ __( 'Link Text', 'poocommerce' ) }
				value={ linkText }
				onChange={ setLinkText }
			/>
			<Button
				isPrimary
				onClick={ () => {
					if ( onInsert ) {
						onInsert( tag.token, linkText );
					}
				} }
			>
				{ __( 'Insert', 'poocommerce' ) }
			</Button>
		</Modal>
	);
};

export { LinkModal };

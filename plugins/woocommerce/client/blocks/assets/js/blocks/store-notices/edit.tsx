/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import NoticeBanner from '@poocommerce/base-components/notice-banner';

/**
 * Internal dependencies
 */
import './editor.scss';

const Edit = (): JSX.Element => {
	const blockProps = useBlockProps( {
		className: 'wc-block-store-notices',
	} );

	return (
		<div { ...blockProps }>
			<NoticeBanner status="info" isDismissible={ false }>
				{ __(
					'Notices added by PooCommerce or extensions will show up here.',
					'poocommerce'
				) }
			</NoticeBanner>
		</div>
	);
};

export default Edit;

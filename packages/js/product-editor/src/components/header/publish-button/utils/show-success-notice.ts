/**
 * External dependencies
 */
import { dispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import type { Product, ProductStatus } from '@poocommerce/data';
import type { ReactElement } from 'react';
/**
 * Internal dependencies
 */
import { formatScheduleDatetime } from '../../../../utils';

function getNoticeContent( product: Product, prevStatus?: ProductStatus ) {
	if ( product.status === 'future' ) {
		return sprintf(
			// translators: %s: The datetime the product is scheduled for.
			__( 'Product scheduled for %s.', 'poocommerce' ),
			formatScheduleDatetime( `${ product.date_created_gmt }+00:00` )
		);
	}

	if ( prevStatus === 'publish' || prevStatus === 'future' ) {
		return __( 'Product updated.', 'poocommerce' );
	}

	return __( 'Product published.', 'poocommerce' );
}

export function showSuccessNotice(
	product: Product,
	prevStatus?: ProductStatus
) {
	const { createSuccessNotice } = dispatch( 'core/notices' );

	const noticeContent = getNoticeContent( product, prevStatus );
	const noticeOptions = {
		icon: '🎉' as unknown as ReactElement,
		actions: [
			{
				label: __( 'View in store', 'poocommerce' ),
				// Leave the url to support a11y.
				url: product.permalink,
				onClick( event: React.MouseEvent< HTMLAnchorElement > ) {
					event.preventDefault();
					// Notice actions do not support target anchor prop,
					// so this forces the page to be opened in a new tab.
					window.open( product.permalink, '_blank' );
				},
			},
		],
	};

	createSuccessNotice( noticeContent, noticeOptions );
}

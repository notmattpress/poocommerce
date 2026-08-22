/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import PageIcon from 'gridicons/dist/pages';
import { getAdminLink } from '@poocommerce/settings';
import { recordEvent } from '@poocommerce/tracks';

export const importTypes = [
	{
		key: 'from-csv' as const,
		title: __( 'FROM A CSV FILE', 'poocommerce' ),
		content: __(
			'Import all products at once by uploading a CSV file.',
			'poocommerce'
		),
		before: <PageIcon />,
		onClick: () => {
			recordEvent( 'tasklist_add_product', { method: 'import' } );
			window.location.href = getAdminLink(
				'edit.php?post_type=product&page=product_importer&wc_onboarding_active_task=products'
			);
		},
	},
];

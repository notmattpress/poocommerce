/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { ProductStatus } from '@poocommerce/data';

type BadgeStatusConfig = {
	label: string;
	intent?: React.ComponentProps< typeof Badge >[ 'intent' ];
};

const statuses = {
	draft: {
		label: __( 'Draft', 'poocommerce' ),
		intent: 'draft',
	},
	publish: {
		label: __( 'Published', 'poocommerce' ),
		intent: 'stable',
	},
	trash: {
		label: __( 'Trash', 'poocommerce' ),
		intent: 'none',
	},
	'auto-draft': {
		label: __( 'Draft', 'poocommerce' ),
		intent: 'draft',
	},
	deleted: {
		label: __( 'Deleted', 'poocommerce' ),
		intent: 'none',
	},
	pending: {
		label: __( 'Pending review', 'poocommerce' ),
		intent: 'informational',
	},
	private: {
		label: __( 'Private', 'poocommerce' ),
		intent: 'none',
	},
	future: {
		label: __( 'Scheduled', 'poocommerce' ),
		intent: 'none',
	},
	any: {
		label: __( 'Any', 'poocommerce' ),
		intent: 'none',
	},
} satisfies Record< ProductStatus, BadgeStatusConfig >;

export const ProductStatusBadge = ( { status }: { status: ProductStatus } ) => {
	const statusData = statuses[ status ];

	if ( ! statusData ) {
		return <Badge intent="none">{ __( 'Unknown', 'poocommerce' ) }</Badge>;
	}

	return <Badge intent={ statusData.intent }>{ statusData.label }</Badge>;
};

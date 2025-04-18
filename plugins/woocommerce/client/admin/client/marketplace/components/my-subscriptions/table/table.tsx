/**
 * External dependencies
 */
import { EmptyTable, Table, TablePlaceholder } from '@poocommerce/components';
import {
	TableHeader,
	TableRow,
} from '@poocommerce/components/build-types/table/types';
import { getNewPath } from '@poocommerce/navigation';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { MARKETPLACE_PATH } from '../../constants';

const tableHeadersDefault = [
	{
		key: 'name',
		label: __( 'Name', 'poocommerce' ),
	},
	{
		key: 'expiry',
		label: __( 'Expires/Renews on', 'poocommerce' ),
	},
	{
		key: 'subscription',
		label: __( 'Subscription', 'poocommerce' ),
	},
	{
		key: 'version',
		label: __( 'Version', 'poocommerce' ),
	},
];

function SubscriptionsTable( props: {
	rows?: TableRow[][];
	headers: TableHeader[];
	isLoading: boolean;
} ) {
	if ( props.isLoading ) {
		return (
			<TablePlaceholder
				caption={ __( 'Loading your subscriptions', 'poocommerce' ) }
				headers={ props.headers }
			/>
		);
	}

	const headersWithClasses = props.headers.map( ( header ) => {
		return {
			...header,
			cellClassName:
				'poocommerce-marketplace__my-subscriptions__table__header--' +
				header.key,
		};
	} );

	return (
		<Table
			className="poocommerce-marketplace__my-subscriptions__table"
			headers={ headersWithClasses }
			rows={ props.rows }
		/>
	);
}

export function InstalledSubscriptionsTable( props: {
	rows?: TableRow[][];
	isLoading: boolean;
} ) {
	const headers = [
		...tableHeadersDefault,
		{
			key: 'actions',
			label: __( 'Actions', 'poocommerce' ),
		},
	];

	if ( ! props.isLoading && ( ! props.rows || props.rows.length === 0 ) ) {
		const marketplaceBrowseURL = getNewPath( {}, MARKETPLACE_PATH, {} );
		const noInstalledSubscriptionsHTML = createInterpolateElement(
			__(
				'No extensions or themes installed. <a>Browse the Marketplace</a>',
				'poocommerce'
			),
			{
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				a: <a href={ marketplaceBrowseURL } />,
			}
		);

		return (
			<EmptyTable numberOfRows={ 4 }>
				{ noInstalledSubscriptionsHTML }
			</EmptyTable>
		);
	}

	return (
		<SubscriptionsTable
			rows={ props.rows }
			isLoading={ props.isLoading }
			headers={ headers }
		/>
	);
}

export function AvailableSubscriptionsTable( props: {
	rows?: TableRow[][];
	isLoading: boolean;
} ) {
	const headers = [
		...tableHeadersDefault,
		{
			key: 'actions',
			label: __( 'Actions', 'poocommerce' ),
		},
	];

	return (
		<SubscriptionsTable
			rows={ props.rows }
			isLoading={ props.isLoading }
			headers={ headers }
		/>
	);
}

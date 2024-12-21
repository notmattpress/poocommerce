/**
 * External dependencies
 */
import { TableSummary } from '@poocommerce/components';
import { Card, CardFooter } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { summary } from './index';

export const Basic = () => (
	<Card>
		<CardFooter justify="center">
			<TableSummary data={ summary } />
		</CardFooter>
	</Card>
);

export default {
	title: 'PooCommerce Admin/components/TableSummary',
	component: TableSummary,
};

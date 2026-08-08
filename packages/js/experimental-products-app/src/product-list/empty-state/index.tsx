/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, EmptyState } from '@wordpress/ui';

/**
 * Internal dependencies
 */
import type { StatusTab } from '../constants';
import { ProductListEmptyStateIcon } from './icon';

type EmptyStateCopy = {
	title: string;
	description: string;
};

function getEmptyStateCopy(
	tab: StatusTab,
	isSearchOrFilterResult: boolean
): EmptyStateCopy {
	if ( isSearchOrFilterResult ) {
		return {
			title: __( 'No products match your filters', 'poocommerce' ),
			description: __(
				'Try clearing some filters or adjusting your search query.',
				'poocommerce'
			),
		};
	}

	switch ( tab ) {
		case 'publish':
			return {
				title: __( 'No products published yet', 'poocommerce' ),
				description: __(
					'Check your drafts or add a new product to start selling.',
					'poocommerce'
				),
			};
		case 'draft':
			return {
				title: __( 'No draft products yet', 'poocommerce' ),
				description: __(
					'Any products you save as drafts will be listed here.',
					'poocommerce'
				),
			};
		case 'pending':
			return {
				title: __( 'No products awaiting review', 'poocommerce' ),
				description: __(
					'Products submitted for review will appear here.',
					'poocommerce'
				),
			};
		case 'trash':
			return {
				title: __( 'No products in trash', 'poocommerce' ),
				description: __(
					'Deleted products will move here, where you can restore or remove them permanently.',
					'poocommerce'
				),
			};
		case 'all':
		default:
			return {
				title: __( 'No products yet', 'poocommerce' ),
				description: __(
					'All your products will appear here.',
					'poocommerce'
				),
			};
	}
}

type ProductListEmptyStateProps = {
	isSearchOrFilterResult?: boolean;
	onClearFilters?: () => void;
	tab: StatusTab;
};

export function ProductListEmptyState( {
	isSearchOrFilterResult = false,
	onClearFilters,
	tab,
}: ProductListEmptyStateProps ) {
	const { title, description } = getEmptyStateCopy(
		tab,
		isSearchOrFilterResult
	);

	return (
		<EmptyState.Root className="poocommerce-product-list__empty-state">
			<EmptyState.Visual>
				<ProductListEmptyStateIcon />
			</EmptyState.Visual>
			<EmptyState.Title>{ title }</EmptyState.Title>
			<EmptyState.Description className="poocommerce-product-list__empty-state-description">
				{ description }
			</EmptyState.Description>
			{ isSearchOrFilterResult && onClearFilters && (
				<EmptyState.Actions>
					<Button variant="outline" onClick={ onClearFilters }>
						{ __( 'Clear filters', 'poocommerce' ) }
					</Button>
				</EmptyState.Actions>
			) }
		</EmptyState.Root>
	);
}

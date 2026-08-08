/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { isValidElement } from '@wordpress/element';
import { Stack } from '@wordpress/ui';

type Item = {
	id: number | string;
	title: string;
	thumbnail?: string | JSX.Element;
	meta?: string;
	altText?: string;
};

interface ListItemProps {
	items: Item[];
	onRemove?: ( item: Item ) => void;
	showRemoveButton?: boolean;
}

export const ListItem = ( {
	items,
	onRemove,
	showRemoveButton = true,
}: ListItemProps ) => {
	return (
		<Stack direction="column">
			{ items.map( ( item ) => (
				<Stack
					key={ item.id }
					direction="row"
					align="center"
					justify="space-between"
					className="poocommerce-list-item"
					gap={ 'md' }
				>
					{ item.thumbnail && (
						<div className="poocommerce-list-item__thumbnail">
							{ typeof item.thumbnail === 'string' && (
								<img
									src={ item.thumbnail }
									alt={ item.altText ?? '' }
									className="poocommerce-list-item__thumbnail-image"
								/>
							) }
							{ isValidElement( item.thumbnail ) &&
								item.thumbnail }
						</div>
					) }
					<Stack
						className="poocommerce-list-item__info"
						direction="column"
					>
						<div className="poocommerce-list-item__title">
							{ item.title }
						</div>
						{ item.meta && (
							<div className="poocommerce-list-item__meta">
								{ item.meta }
							</div>
						) }
					</Stack>
					{ showRemoveButton && onRemove && (
						<Button
							icon={ close }
							variant="tertiary"
							iconSize={ 16 }
							onClick={ () => onRemove( item ) }
							aria-label={ __( 'Remove item', 'poocommerce' ) }
							className="poocommerce-list-item__remove-button"
						/>
					) }
				</Stack>
			) ) }
		</Stack>
	);
};

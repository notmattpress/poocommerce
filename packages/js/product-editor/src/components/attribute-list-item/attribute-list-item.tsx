/**
 * External dependencies
 */
import { DragEventHandler } from 'react';
import { ListItem, Tag } from '@poocommerce/components';
import { ProductProductAttribute } from '@poocommerce/data';
import { sprintf, __ } from '@wordpress/i18n';
import { Button, Tooltip } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import NotFilterableIcon from './not-filterable-icon';
import SeenIcon from '../../icons/seen-icon';

type AttributeListItemProps = {
	attribute: ProductProductAttribute;
	editLabel?: string;
	removeLabel?: string;
	onDragStart?: DragEventHandler< HTMLDivElement >;
	onDragEnd?: DragEventHandler< HTMLDivElement >;
	onEditClick?: ( attribute: ProductProductAttribute ) => void;
	onRemoveClick?: ( attribute: ProductProductAttribute ) => void;
};

const VISIBLE_TEXT = __( 'Visible in product details', 'poocommerce' );
const NOT_FILTERABLE_CUSTOM_ATTR_TEXT = __(
	'Custom attribute. Customers can’t filter or search by it to find this product',
	'poocommerce'
);

export const AttributeListItem = ( {
	attribute,
	editLabel = __( 'Edit', 'poocommerce' ),
	removeLabel = __( 'Remove attribute', 'poocommerce' ),
	onDragStart,
	onDragEnd,
	onEditClick,
	onRemoveClick,
}: AttributeListItemProps ) => {
	return (
		<ListItem
			className="poocommerce-attribute-list-item"
			onDragStart={ onDragStart }
			onDragEnd={ onDragEnd }
		>
			<div>{ attribute.name }</div>
			<div>
				{ attribute.options
					.slice( 0, attribute.options.length > 3 ? 2 : 3 )
					.map( ( option ) => (
						<Tag key={ option } label={ option } />
					) ) }
				{ attribute.options.length > 3 && (
					<Tag
						label={ sprintf(
							/* translators: %i: number of additional attribute values that are hidden */
							__( '+ %d more', 'poocommerce' ),
							attribute.options.length - 2
						) }
					/>
				) }
			</div>
			<div className="poocommerce-attribute-list-item__actions">
				{ attribute.id === 0 && (
					<Tooltip
						// @ts-expect-error className is missing in TS, should remove this when it is included.
						className="poocommerce-attribute-list-item__actions-tooltip"
						position="top center"
						text={ NOT_FILTERABLE_CUSTOM_ATTR_TEXT }
					>
						<div className="poocommerce-attribute-list-item__actions-icon-wrapper">
							<NotFilterableIcon className="poocommerce-attribute-list-item__actions-icon-wrapper-icon" />
						</div>
					</Tooltip>
				) }
				{ attribute.visible && (
					<Tooltip
						// @ts-expect-error className is missing in TS, should remove this when it is included.
						className="poocommerce-attribute-list-item__actions-tooltip"
						placement="top"
						text={ VISIBLE_TEXT }
					>
						<div className="poocommerce-attribute-list-item__actions-icon-wrapper">
							<SeenIcon className="poocommerce-attribute-list-item__actions-icon-wrapper-icon" />
						</div>
					</Tooltip>
				) }
				{ typeof onEditClick === 'function' && (
					<Button
						variant="tertiary"
						onClick={ () => onEditClick( attribute ) }
					>
						{ editLabel }
					</Button>
				) }
				{ typeof onRemoveClick === 'function' && (
					<Button
						icon={ closeSmall }
						label={ removeLabel }
						onClick={ () => onRemoveClick( attribute ) }
					></Button>
				) }
			</div>
		</ListItem>
	);
};

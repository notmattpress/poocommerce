/**
 * External dependencies
 */
import { sprintf, __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { Icon } from '@wordpress/components';
import { createElement, Fragment } from '@wordpress/element';
import { __experimentalSelectControlMenuItem as MenuItem } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import type {
	MenuAttributeListProps,
	AttributeInputFieldItemProps,
	UseComboboxGetMenuPropsOptions,
} from './types';

function isNewAttributeListItem(
	attribute: AttributeInputFieldItemProps
): boolean {
	return attribute.id === -99;
}

function sanitizeSlugName( slug: string | undefined ): string {
	return slug && slug.startsWith( 'pa_' ) ? slug.substring( 3 ) : '';
}

export const MenuAttributeList = ( {
	disabledAttributeMessage = '',
	renderItems,
	highlightedIndex,
	getItemProps,
}: MenuAttributeListProps ) => {
	if ( renderItems.length > 0 ) {
		return (
			<Fragment>
				{ renderItems.map( ( item, index: number ) => (
					<MenuItem
						key={ item.id }
						index={ index }
						isActive={ highlightedIndex === index }
						item={ item }
						getItemProps={ (
							options: UseComboboxGetMenuPropsOptions
						) => ( {
							...getItemProps( options ),
							disabled: item.isDisabled || undefined,
						} ) }
						tooltipText={
							item.isDisabled
								? disabledAttributeMessage
								: sanitizeSlugName( item.slug )
						}
					>
						{ isNewAttributeListItem( item ) ? (
							<div className="poocommerce-attribute-input-field__add-new">
								<Icon
									icon={ plus }
									size={ 20 }
									className="poocommerce-attribute-input-field__add-new-icon"
								/>
								<span>
									{ sprintf(
										/* translators: The name of the new attribute term to be created */
										__( 'Create "%s"', 'poocommerce' ),
										item.name
									) }
								</span>
							</div>
						) : (
							item.name
						) }
					</MenuItem>
				) ) }
			</Fragment>
		);
	}
	return (
		<div className="poocommerce-attribute-input-field__no-results">
			{ __( 'Nothing yet. Type to create.', 'poocommerce' ) }
		</div>
	);
};

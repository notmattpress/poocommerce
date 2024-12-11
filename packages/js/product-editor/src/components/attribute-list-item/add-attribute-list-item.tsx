/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { ListItem } from '@poocommerce/components';
import { createElement } from '@wordpress/element';

type NewAttributeListItemProps = {
	label?: string;
	onClick?: () => void;
};

export const NewAttributeListItem: React.FC< NewAttributeListItemProps > = ( {
	label = __( 'Add attribute', 'poocommerce' ),
	onClick,
} ) => {
	return (
		<ListItem className="poocommerce-add-attribute-list-item">
			<Button
				variant="secondary"
				className="poocommerce-add-attribute-list-item__add-button"
				onClick={ onClick }
			>
				{ label }
			</Button>
		</ListItem>
	);
};

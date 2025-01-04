/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuGroup, MenuItem } from '@wordpress/components';
import { cog, Icon } from '@wordpress/icons';
import { __experimentalWooProductMoreMenuItem as WooProductMoreMenuItem } from '@poocommerce/product-editor';

export function ProductEditorDevToolsMenu( {
	shouldShowDevTools,
	onToggleShowDevTools,
}: {
	shouldShowDevTools: boolean;
	onToggleShowDevTools: () => void;
} ) {
	return (
		<WooProductMoreMenuItem order={ 1000 }>
			{ ( { onClose }: { onClose: () => void } ) => (
				<MenuGroup label={ __( 'Developer tools', 'poocommerce' ) }>
					<MenuItem
						icon={ <Icon icon={ cog } /> }
						iconPosition="right"
						onClick={ () => {
							onToggleShowDevTools();
							onClose();
						} }
					>
						{ shouldShowDevTools
							? __( 'Hide developer tools', 'poocommerce' )
							: __( 'Show developer tools', 'poocommerce' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</WooProductMoreMenuItem>
	);
}

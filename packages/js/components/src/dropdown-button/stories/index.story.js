/**
 * External dependencies
 */
import { Dropdown } from '@wordpress/components';
import { DropdownButton } from '@poocommerce/components';

export const Basic = () => (
	<Dropdown
		renderToggle={ ( { isOpen, onToggle } ) => (
			<DropdownButton
				onClick={ onToggle }
				isOpen={ isOpen }
				labels={ [ 'All products Sold' ] }
			/>
		) }
		renderContent={ () => <p>Dropdown content here</p> }
	/>
);

export default {
	title: 'Components/DropdownButton',
	component: DropdownButton,
};

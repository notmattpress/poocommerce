/**
 * External dependencies
 */
import clsx from 'clsx';
import { navigateTo, getNewPath } from '@poocommerce/navigation';

/**
 * Internal dependencies
 */
import { Category } from './types';

export default function CategoryLink( props: Category ): JSX.Element {
	function updateCategorySelection(
		event: React.MouseEvent< HTMLButtonElement >
	) {
		const slug = event.currentTarget.value;

		if ( ! slug ) {
			return;
		}

		navigateTo( {
			url: getNewPath( { category: slug } ),
		} );
	}

	const isLoading = props.label === '';

	const classes = clsx( 'poocommerce-marketplace__category-item-button', {
		'poocommerce-marketplace__category-item-button--selected':
			props.selected,
		'is-loading': isLoading,
	} );

	return (
		<button
			className={ classes }
			onClick={ updateCategorySelection }
			value={ props.slug }
			aria-hidden={ isLoading }
		>
			{ props.label }
		</button>
	);
}

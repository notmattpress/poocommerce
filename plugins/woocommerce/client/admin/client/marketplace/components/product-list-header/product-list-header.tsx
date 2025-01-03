/**
 * External dependencies
 */
import clsx from 'clsx';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { Link } from '@poocommerce/components';
import { isRTL, __ } from '@wordpress/i18n';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import './product-list-header.scss';

interface ProductListHeaderProps {
	title: string;
	groupURL: string | null;
}

export default function ProductListHeader(
	props: ProductListHeaderProps
): JSX.Element {
	const { title, groupURL } = props;
	const isLoading = title === '';

	const classNames = clsx( 'poocommerce-marketplace__product-list-header', {
		'is-loading': isLoading,
	} );

	return (
		<div className={ classNames } aria-hidden={ isLoading }>
			<h2 className="poocommerce-marketplace__product-list-title">
				{ title }
			</h2>
			{ groupURL !== null && (
				<span className="poocommerce-marketplace__product-list-link">
					<Link
						href={ groupURL }
						target="_blank"
						onClick={ () => {
							recordEvent( 'marketplace_see_more_clicked', {
								group_title: title,
								group_url: groupURL,
							} );
						} }
					>
						{ __( 'See more', 'poocommerce' ) }
						<Icon icon={ isRTL() ? chevronLeft : chevronRight } />
					</Link>
				</span>
			) }
		</div>
	);
}

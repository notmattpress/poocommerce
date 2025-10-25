/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { createElement } from '@wordpress/element';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { sprintf, __ } from '@wordpress/i18n';
import clsx from 'clsx';

type PageArrowsProps = {
	currentPage: number;
	pageCount: number;
	showPageArrowsLabel?: boolean;
	setCurrentPage: (
		page: number,
		action?: 'previous' | 'next' | 'goto'
	) => void;
};

export function PageArrows( {
	pageCount,
	currentPage,
	showPageArrowsLabel = true,
	setCurrentPage,
}: PageArrowsProps ) {
	function previousPage( event: React.MouseEvent ) {
		event.stopPropagation();
		if ( currentPage - 1 < 1 ) {
			return;
		}
		setCurrentPage( currentPage - 1, 'previous' );
	}

	function nextPage( event: React.MouseEvent ) {
		event.stopPropagation();
		if ( currentPage + 1 > pageCount ) {
			return;
		}
		setCurrentPage( currentPage + 1, 'next' );
	}

	if ( pageCount <= 1 ) {
		return null;
	}

	const previousLinkClass = clsx( 'poocommerce-pagination__link', {
		'is-active': currentPage > 1,
	} );

	const nextLinkClass = clsx( 'poocommerce-pagination__link', {
		'is-active': currentPage < pageCount,
	} );

	return (
		<div className="poocommerce-pagination__page-arrows">
			{ showPageArrowsLabel && (
				<span
					className="poocommerce-pagination__page-arrows-label"
					role="status"
					aria-live="polite"
				>
					{ sprintf(
						/* translators: 1: current page number, 2: total number of pages */
						__( 'Page %1$d of %2$d', 'poocommerce' ),
						currentPage,
						pageCount
					) }
				</span>
			) }
			<div className="poocommerce-pagination__page-arrows-buttons">
				<Button
					className={ previousLinkClass }
					disabled={ ! ( currentPage > 1 ) }
					onClick={ previousPage }
					label={ __( 'Previous Page', 'poocommerce' ) }
				>
					<Icon icon={ chevronLeft } />
				</Button>
				<Button
					className={ nextLinkClass }
					disabled={ ! ( currentPage < pageCount ) }
					onClick={ nextPage }
					label={ __( 'Next Page', 'poocommerce' ) }
				>
					<Icon icon={ chevronRight } />
				</Button>
			</div>
		</div>
	);
}

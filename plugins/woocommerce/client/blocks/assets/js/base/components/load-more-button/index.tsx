/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { MouseEventHandler } from 'react';
import Label from '@poocommerce/blocks-components/label'; // Import the component directly because the package root also loads data stores.

/**
 * Internal dependencies
 */
import './style.scss';

interface LoadMoreButtonProps {
	onClick: MouseEventHandler;
	label?: string;
	screenReaderLabel?: string;
}

export const LoadMoreButton = ( {
	onClick,
	label = __( 'Load more', 'poocommerce' ),
	screenReaderLabel = __( 'Load more', 'poocommerce' ),
}: LoadMoreButtonProps ): JSX.Element => {
	return (
		<div className="wp-block-button wc-block-load-more wc-block-components-load-more">
			<button className="wp-block-button__link" onClick={ onClick }>
				<Label
					label={ label }
					screenReaderLabel={ screenReaderLabel }
				/>
			</button>
		</div>
	);
};

export default LoadMoreButton;

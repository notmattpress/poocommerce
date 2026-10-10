/**
 * External dependencies
 */
import React from '@wordpress/element';
import { external, Icon } from '@wordpress/icons';
import { Link } from '@poocommerce/components';
import { Text } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import './style.scss';

export const QuickLink = ( { icon, title, href, linkType, onClick } ) => {
	const isExternal = linkType === 'external';

	return (
		<div className="poocommerce-quick-links__item">
			<Link
				onClick={ onClick }
				href={ href }
				type={ linkType }
				target={ isExternal ? '_blank' : null }
				className="poocommerce-quick-links__item-link"
			>
				<Icon
					className="poocommerce-quick-links__item-link__icon"
					icon={ icon }
				/>
				<Text
					className="poocommerce-quick-links__item-link__text"
					as="div"
					variant="button"
					weight="600"
					size="14"
					lineHeight="20px"
				>
					{ title }
				</Text>
				{ isExternal && <Icon icon={ external } /> }
			</Link>
		</div>
	);
};

/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { Card, CardBody, Icon } from '@wordpress/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Link from '../link';

const AbbreviatedCard = ( {
	children,
	className,
	href,
	icon,
	onClick,
	type,
} ) => {
	return (
		<Card className={ clsx( 'poocommerce-abbreviated-card', className ) }>
			<CardBody size={ null }>
				<Link href={ href } onClick={ onClick } type={ type }>
					<div className="poocommerce-abbreviated-card__icon">
						<Icon icon={ icon } />
					</div>
					<div className="poocommerce-abbreviated-card__content">
						{ children }
					</div>
				</Link>
			</CardBody>
		</Card>
	);
};

AbbreviatedCard.propTypes = {
	/**
	 * The Abbreviated Card content.
	 */
	children: PropTypes.node.isRequired,
	/**
	 * Additional CSS classes.
	 */
	className: PropTypes.string,
	/**
	 * The resource to link to.
	 */
	href: PropTypes.string.isRequired,
	/**
	 * Icon for the Abbreviated Card.
	 */
	icon: PropTypes.element.isRequired,
	/**
	 * Called when the card is clicked.
	 */
	onClick: PropTypes.func,
	/**
	 * Type of link.
	 */
	type: PropTypes.oneOf( [ 'wp-admin', 'wc-admin', 'external' ] ),
};

export default AbbreviatedCard;

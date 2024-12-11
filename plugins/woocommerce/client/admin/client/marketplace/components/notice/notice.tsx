/**
 * External dependencies
 */
import clsx from 'clsx';
import { useEffect, useState } from '@wordpress/element';
import { Icon, check, closeSmall, info, percent } from '@wordpress/icons'; // See: https://wordpress.github.io/gutenberg/?path=/docs/icons-icon--docs

/**
 * Internal dependencies
 */
import './notice.scss';
import sanitizeHTML from '../../../lib/sanitize-html';

export interface NoticeProps {
	id: string;
	children?: React.ReactNode;
	description: string;
	icon?: string;
	isDismissible: boolean;
	variant: string;
	onClose?: () => void;
	onLoad?: () => void;
}

type IconKey = keyof typeof iconMap;

// Map the icon name (string) to the actual icon component
const iconMap = {
	info,
	check,
	percent,
};

export default function Notice( props: NoticeProps ): JSX.Element | null {
	const {
		id,
		description,
		children,
		icon,
		isDismissible = true,
		variant = 'info',
		onClose,
		onLoad,
	} = props;
	const [ isVisible, setIsVisible ] = useState(
		localStorage.getItem( `wc-marketplaceNoticeClosed-${ id }` ) !== 'true'
	);

	const handleClose = () => {
		setIsVisible( false );
		localStorage.setItem( `wc-marketplaceNoticeClosed-${ id }`, 'true' );
		if ( typeof onClose === 'function' ) {
			onClose();
		}
	};

	useEffect( () => {
		if ( isVisible && typeof onLoad === 'function' ) {
			onLoad();
		}
		// only run once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isVisible ] );

	if ( ! isVisible ) return null;

	const classes = clsx(
		'poocommerce-marketplace__notice',
		`poocommerce-marketplace__notice--${ variant }`,
		{
			'is-dismissible': isDismissible,
		}
	);

	const iconElement = iconMap[ ( icon || 'info' ) as IconKey ];

	const iconClass = clsx(
		'poocommerce-marketplace__notice-icon',
		`poocommerce-marketplace__notice-icon--${ variant }`
	);

	return (
		<div className={ classes }>
			{ icon && (
				<span className={ iconClass }>
					<Icon icon={ iconElement } />
				</span>
			) }
			<div className="poocommerce-marketplace__notice-content">
				<p
					className="poocommerce-marketplace__notice-description"
					dangerouslySetInnerHTML={ sanitizeHTML( description ) }
				/>
				{ children && (
					<div className="poocommerce-marketplace__notice-children">
						{ children }
					</div>
				) }
			</div>
			{ isDismissible && (
				<button
					className="poocommerce-marketplace__notice-close"
					aria-label="Close"
					onClick={ handleClose }
				>
					<Icon icon={ closeSmall } />
				</button>
			) }
		</div>
	);
}

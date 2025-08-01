/**
 * External dependencies
 */
import { createElement } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { store as coreDataStore } from '@wordpress/core-data';
import clsx from 'clsx';

type SiteIconProps = {
	className: string;
};

function SiteIcon( { className }: SiteIconProps ) {
	const { isRequestingSite, siteIconUrl } = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreDataStore );
		// @ts-expect-error Selector is not right typed with '__unstableBase'
		const siteData = getEntityRecord( 'root', '__unstableBase' ) as
			| { site_icon_url?: string }
			| undefined;

		return {
			isRequestingSite: ! siteData,
			siteIconUrl: siteData?.site_icon_url,
		};
	}, [] );

	if ( isRequestingSite && ! siteIconUrl ) {
		return <div className="edit-site-site-icon__image" />;
	}

	const icon = siteIconUrl ? (
		<img
			className="edit-site-site-icon__image"
			alt={ __( 'Site Icon', 'poocommerce' ) }
			src={ siteIconUrl }
		/>
	) : (
		<Icon
			className="edit-site-site-icon__icon"
			icon={ wordpress }
			size={ 48 }
		/>
	);

	return (
		<div className={ clsx( className, 'edit-site-site-icon' ) }>
			{ icon }
		</div>
	);
}

export default SiteIcon;

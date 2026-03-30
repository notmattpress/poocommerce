/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createElement } from '@wordpress/element';

type RecommendedRibbonProps = {
	isLocalPartner?: boolean;
};

export const RecommendedRibbon: React.VFC< RecommendedRibbonProps > = ( {
	isLocalPartner = false,
} ) => {
	const text = isLocalPartner
		? __( 'Local Partner', 'poocommerce' )
		: __( 'Recommended', 'poocommerce' );

	return (
		<div className={ 'poocommerce-task-payment__recommended-ribbon' }>
			<span>{ text }</span>
		</div>
	);
};

export const WOOCOMMERCE_ID = 'poocommerce/poocommerce';

export const getDefaultTemplateProps = ( templateTitle: string ) => {
	return {
		templateTitle,
		addedBy: WOOCOMMERCE_ID,
		hasActions: false,
	};
};

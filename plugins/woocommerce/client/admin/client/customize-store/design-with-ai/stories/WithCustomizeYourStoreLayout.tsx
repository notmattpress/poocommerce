/**
 * Internal dependencies
 */
import '../../style.scss';

export const WithCustomizeYourStoreLayout = ( Story: React.ComponentType ) => {
	return (
		<div className="poocommerce-customize-store poocommerce-admin-full-screen">
			<Story />
		</div>
	);
};

/**
 * External dependencies
 */
import { ScrollTo } from '@poocommerce/components';

export const Basic = () => (
	<ScrollTo>
		<div>
			Have the web browser automatically scroll to this component on page
			render.
		</div>
	</ScrollTo>
);

export default {
	title: 'PooCommerce Admin/components/ScrollTo',
	component: ScrollTo,
};

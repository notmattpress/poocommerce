/**
 * External dependencies
 */
import { ViewMoreList } from '@poocommerce/components';

export const Basic = () => (
	<ViewMoreList
		// eslint-disable-next-line react/jsx-key
		items={ [ <i>Lorem</i>, <i>Ipsum</i>, <i>Dolor</i>, <i>Sit</i> ] }
	/>
);

export default {
	title: 'Components/ViewMoreList',
	component: ViewMoreList,
};

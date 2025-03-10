/**
 * External dependencies
 */
import { List } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import './cards.scss';

type Card = {
	key: string;
	title: string;
	content: string | JSX.Element;
	before: JSX.Element;
};

type CardListProps = {
	items: Card[];
};

const CardList: React.FC< CardListProps > = ( { items } ) => {
	return (
		<div className="poocommerce-products-card-list">
			<List items={ items } />
		</div>
	);
};

export default CardList;

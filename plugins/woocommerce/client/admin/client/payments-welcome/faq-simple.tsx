/**
 * External dependencies
 */
import { Card } from '@wordpress/components';
import { Icon, help } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import strings from './strings';

const FrequentlyAskedQuestionsSimple = () => {
	return (
		<Card className="woopayments-welcome-page__faq">
			<Icon icon={ help } />
			<span>{ strings.faq.haveQuestions } </span>
			<a
				href="https://poocommerce.com/my-account/tickets/"
				target="_blank"
				rel="noreferrer"
			>
				{ strings.faq.getInTouch }
			</a>
		</Card>
	);
};

export default FrequentlyAskedQuestionsSimple;

/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { queueRecordEvent } from '@poocommerce/tracks';

interface LoadMoreProps {
	onLoadMore: () => void;
	isBusy: boolean;
	disabled: boolean;
}

export default function LoadMoreButton( props: LoadMoreProps ) {
	const { onLoadMore, isBusy, disabled } = props;
	function handleClick() {
		queueRecordEvent( 'marketplace_load_more_button_clicked', {} );
		onLoadMore();
	}

	if ( isBusy ) {
		speak( __( 'Loading more products', 'poocommerce' ) );
	}

	return (
		<Button
			className="poocommerce-marketplace__load-more"
			variant={ 'secondary' }
			onClick={ handleClick }
			isBusy={ isBusy }
			disabled={ disabled }
		>
			{ __( 'Load more', 'poocommerce' ) }
		</Button>
	);
}

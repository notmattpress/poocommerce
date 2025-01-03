/**
 * External dependencies
 */
import clsx from 'clsx';
import SnackbarList from '@poocommerce/base-components/snackbar-list';
import { useDispatch } from '@wordpress/data';
import type { NoticeType } from '@poocommerce/types';

const SnackbarNotices = ( {
	className,
	notices,
}: {
	className: string;
	notices: NoticeType[];
} ): JSX.Element | null => {
	const { removeNotice } = useDispatch( 'core/notices' );

	return (
		<SnackbarList
			className={ clsx(
				className,
				'wc-block-components-notices__snackbar'
			) }
			notices={ notices }
			onRemove={ ( noticeId: string ) => {
				notices.forEach( ( notice ) => {
					if ( notice.explicitDismiss && notice.id === noticeId ) {
						removeNotice( notice.id, notice.context );
					} else if ( ! notice.explicitDismiss ) {
						removeNotice( notice.id, notice.context );
					}
				} );
			} }
		/>
	);
};

export default SnackbarNotices;

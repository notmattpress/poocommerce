/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useLocalStorageState } from '@poocommerce/base-hooks';
import {
	createInterpolateElement,
	useEffect,
	useRef,
} from '@wordpress/element';
import {
	MIGRATION_STATUS_LS_KEY,
	getInitialStatusLSValue,
	incrementUpgradeStatusDisplayCount,
} from '@poocommerce/blocks/migration-products-to-product-collection';
import { recordEvent } from '@poocommerce/tracks';
import { UpgradeDowngradeNotice } from '@poocommerce/editor-components/upgrade-downgrade-notice';

const notice = createInterpolateElement(
	__(
		'Products (Beta) block was upgraded to <strongText />, an updated version with new features and simplified settings.',
		'poocommerce'
	),
	{
		strongText: (
			<strong>{ __( `Product Collection`, 'poocommerce' ) }</strong>
		),
	}
);

const buttonLabel = __( 'Revert to Products (Beta)', 'poocommerce' );

type UpgradeNoticeProps = {
	revertMigration: () => void;
};

const UpgradeNotice = ( { revertMigration }: UpgradeNoticeProps ) => {
	const [ upgradeNoticeStatus, setUpgradeNoticeStatus ] =
		useLocalStorageState(
			MIGRATION_STATUS_LS_KEY,
			getInitialStatusLSValue()
		);

	const canCountDisplays = useRef( true );
	const { status } = upgradeNoticeStatus;

	const handleRemove = () => {
		setUpgradeNoticeStatus( {
			status: 'seen',
			time: Date.now(),
		} );
	};

	const handleRevert = () => {
		revertMigration();
		recordEvent(
			'blocks_product_collection_migration_between_products_beta',
			{
				transform_to: 'products_beta',
			}
		);
	};

	// Prevent the possibility to count displays multiple times when the
	// block is selected and Inspector Controls are re-rendered multiple times.
	useEffect( () => {
		const countDisplay = () => {
			if ( canCountDisplays.current ) {
				incrementUpgradeStatusDisplayCount();
				canCountDisplays.current = false;
			}
		};

		return countDisplay;
	}, [ canCountDisplays ] );

	return status === 'notseen' ? (
		<UpgradeDowngradeNotice
			actionLabel={ buttonLabel }
			onActionClick={ handleRevert }
			onRemove={ handleRemove }
		>
			{ notice }
		</UpgradeDowngradeNotice>
	) : null;
};

export default UpgradeNotice;

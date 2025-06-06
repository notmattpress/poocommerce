/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	createInterpolateElement,
	useContext,
	useState,
} from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Link } from '@poocommerce/components';
import { optionsStore } from '@poocommerce/data';
import { Button, Modal, CheckboxControl, Spinner } from '@wordpress/components';
import interpolateComponents from '@automattic/interpolate-components';

/**
 * Internal dependencies
 */
import { SidebarNavigationScreen } from '../sidebar-navigation-screen';
import { ADMIN_URL } from '~/utils/admin-settings';
import { FontPairing } from '../global-styles';
import { CustomizeStoreContext } from '../..';
import { trackEvent } from '~/customize-store/tracking';
import { enableTracking } from '~/customize-store/design-without-ai/services';

export const SidebarNavigationScreenTypography = ( {
	onNavigateBackClick,
}: {
	onNavigateBackClick: () => void;
} ) => {
	const { context } = useContext( CustomizeStoreContext );
	const isFontLibraryAvailable = context.isFontLibraryAvailable;

	const title = __( 'Choose fonts', 'poocommerce' );
	const label = __(
		'Select the pair of fonts that best suits your brand. The larger font will be used for headings, and the smaller for supporting content. You can change your font at any time in Editor.',
		'poocommerce'
	);

	const trackingAllowed = useSelect(
		( select ) =>
			select( optionsStore ).getOption( 'poocommerce_allow_tracking' ),
		[]
	);

	const isTrackingDisallowed = trackingAllowed === 'no' || ! trackingAllowed;
	let upgradeNotice;
	if ( isTrackingDisallowed && ! isFontLibraryAvailable ) {
		upgradeNotice = __(
			'Upgrade to the <WordPressLink>latest version of WordPress</WordPressLink> and <OptInModal>opt in to usage tracking</OptInModal> to get access to more fonts.',
			'poocommerce'
		);
	} else if ( isTrackingDisallowed && isFontLibraryAvailable ) {
		upgradeNotice = __(
			'Opt in to <OptInModal>usage tracking</OptInModal> to get access to more fonts.',
			'poocommerce'
		);
	} else if ( trackingAllowed && ! isFontLibraryAvailable ) {
		upgradeNotice = __(
			'Upgrade to the <WordPressLink>latest version of WordPress</WordPressLink> to get access to more fonts.',
			'poocommerce'
		);
	} else {
		upgradeNotice = '';
	}

	const optIn = () => {
		trackEvent(
			'customize_your_store_assembler_hub_opt_in_usage_tracking'
		);
	};

	const skipOptIn = () => {
		trackEvent(
			'customize_your_store_assembler_hub_skip_opt_in_usage_tracking'
		);
	};

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const openModal = () => setIsModalOpen( true );
	const closeModal = () => setIsModalOpen( false );

	const [ isSettingTracking, setIsSettingTracking ] = useState( false );

	const [ OptInDataSharing, setIsOptInDataSharing ] =
		useState< boolean >( true );

	return (
		<SidebarNavigationScreen
			title={ title }
			onNavigateBackClick={ onNavigateBackClick }
			description={ label }
			content={
				<div className="poocommerce-customize-store_sidebar-typography-content">
					{ isFontLibraryAvailable && <FontPairing /> }
					{ upgradeNotice && (
						<div className="poocommerce-customize-store_sidebar-typography-upgrade-notice">
							<h4>
								{ __(
									'Want more font pairings?',
									'poocommerce'
								) }
							</h4>
							<p>
								{ createInterpolateElement( upgradeNotice, {
									WordPressLink: (
										<Button
											href={ `${ ADMIN_URL }update-core.php` }
											variant="link"
										/>
									),
									OptInModal: (
										<Button
											onClick={ () => {
												openModal();
											} }
											variant="link"
										/>
									),
								} ) }
							</p>
							{ isModalOpen && (
								<Modal
									className={
										'poocommerce-customize-store__opt-in-usage-tracking-modal'
									}
									title={ __(
										'Access more fonts',
										'poocommerce'
									) }
									onRequestClose={ closeModal }
									shouldCloseOnClickOutside={ false }
								>
									<CheckboxControl
										className="core-profiler__checkbox"
										// @ts-expect-error Type mismatch
										label={ interpolateComponents( {
											mixedString: __(
												'More fonts are available! Opt in to connect your store and access the full font library, plus get more relevant content and a tailored store setup experience. Opting in will enable {{link}}usage tracking{{/link}}, which you can opt out of at any time via PooCommerce settings.',
												'poocommerce'
											),
											components: {
												link: (
													<Link
														href="https://poocommerce.com/usage-tracking?utm_medium=product"
														target="_blank"
														type="external"
													/>
												),
											},
										} ) }
										checked={ OptInDataSharing }
										onChange={ setIsOptInDataSharing }
									/>
									<div className="poocommerce-customize-store__design-change-warning-modal-footer">
										<Button
											onClick={ () => {
												skipOptIn();
												closeModal();
											} }
											variant="link"
										>
											{ __( 'Cancel', 'poocommerce' ) }
										</Button>
										<Button
											onClick={ async () => {
												optIn();
												await enableTracking();

												closeModal();
												setIsSettingTracking( false );
											} }
											variant="primary"
											disabled={ ! OptInDataSharing }
										>
											{ isSettingTracking ? (
												<Spinner />
											) : (
												__( 'Opt in', 'poocommerce' )
											) }
										</Button>
									</div>
								</Modal>
							) }
						</div>
					) }
				</div>
			}
		/>
	);
};

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Card, Flex, FlexItem, FlexBlock, Button } from '@wordpress/components';
import { Icon, trendingUp, megaphone, closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { CreateNewCampaignModal } from '~/marketing/components';
import {
	useRegisteredChannels,
	useRecommendedChannels,
	useCampaignTypes,
} from '~/marketing/hooks';
import './IntroductionBanner.scss';
import wooIconUrl from './woo.svg';
import illustrationUrl from './illustration.svg';

type IntroductionBannerProps = {
	onDismissClick: () => void;
	onAddChannelsClick: () => void;
};

export const IntroductionBanner = ( {
	onDismissClick,
	onAddChannelsClick,
}: IntroductionBannerProps ) => {
	const [ isModalOpen, setModalOpen ] = useState( false );
	const { data: dataRegistered } = useRegisteredChannels();
	const { data: dataRecommended } = useRecommendedChannels();
	const { data: dataCampaignTypes } = useCampaignTypes();

	const showButtons = !! (
		dataRegistered?.length && dataCampaignTypes?.length
	);

	/**
	 * Boolean to display the "Add channels" button in the introduction banner.
	 *
	 * This depends on the number of registered channels,
	 * because if there are no registered channels,
	 * the Channels card will not have the "Add channels" toggle button,
	 * and it does not make sense to display the "Add channels" button in this introduction banner
	 * that will do nothing upon click.
	 *
	 * If there are registered channels and recommended channels,
	 * the Channels card will display the  "Add channels" toggle button,
	 * and clicking on the "Add channels" button in this introduction banner
	 * will scroll to the button in Channels card.
	 */
	const showAddChannelsButton = !! (
		dataRegistered?.length && dataRecommended?.length
	);

	return (
		<Card className="poocommerce-marketing-introduction-banner">
			<div className="poocommerce-marketing-introduction-banner-content">
				<div className="poocommerce-marketing-introduction-banner-title">
					{ __(
						'Reach new customers and increase sales without leaving PooCommerce',
						'poocommerce'
					) }
				</div>
				<Flex
					className="poocommerce-marketing-introduction-banner-features"
					direction="column"
					gap={ 1 }
					expanded={ false }
				>
					<FlexItem>
						<Flex>
							<Icon icon={ trendingUp } />
							<FlexBlock>
								{ __(
									'Reach customers on other sales channels',
									'poocommerce'
								) }
							</FlexBlock>
						</Flex>
					</FlexItem>
					<FlexItem>
						<Flex>
							<Icon icon={ megaphone } />
							<FlexBlock>
								{ __(
									'Advertise with marketing campaigns',
									'poocommerce'
								) }
							</FlexBlock>
						</Flex>
					</FlexItem>
					<FlexItem>
						<Flex>
							<img
								src={ wooIconUrl }
								alt={ __( 'PooCommerce logo', 'poocommerce' ) }
								width="24"
								height="24"
							/>
							<FlexBlock>
								{ __( 'Built by PooCommerce', 'poocommerce' ) }
							</FlexBlock>
						</Flex>
					</FlexItem>
				</Flex>
				{ showButtons && (
					<Flex
						className="poocommerce-marketing-introduction-banner-buttons"
						justify="flex-start"
					>
						<Button
							variant="primary"
							onClick={ () => {
								setModalOpen( true );
							} }
						>
							{ __( 'Create a campaign', 'poocommerce' ) }
						</Button>
						{ showAddChannelsButton && (
							<Button
								variant="secondary"
								onClick={ onAddChannelsClick }
							>
								{ __( 'Add channels', 'poocommerce' ) }
							</Button>
						) }
					</Flex>
				) }
				{ isModalOpen && (
					<CreateNewCampaignModal
						onRequestClose={ () => setModalOpen( false ) }
					/>
				) }
			</div>
			<div className="poocommerce-marketing-introduction-banner-illustration">
				<Button
					isSmall
					className="poocommerce-marketing-introduction-banner-close-button"
					onClick={ onDismissClick }
				>
					<Icon icon={ closeSmall } />
				</Button>
				<div
					className="poocommerce-marketing-introduction-banner-image-placeholder"
					style={ {
						backgroundImage: `url("${ illustrationUrl }")`,
					} }
				/>
			</div>
		</Card>
	);
};

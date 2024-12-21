/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';
import { recordEvent } from '@poocommerce/tracks';
import { navigateTo, getNewPath } from '@poocommerce/navigation';
import { useUser } from '@poocommerce/data';

/**
 * Internal dependencies
 */
import { Product } from '../product-list/types';
import { MarketplaceContext } from '../../contexts/marketplace-context';

function ProductCardFooter( props: { product: Product } ) {
	const { product } = props;
	const { user, currentUserCan } = useUser();
	const { selectedTab, isProductInstalled } =
		useContext( MarketplaceContext );

	function openInstallModal() {
		recordEvent( 'marketplace_add_to_store_clicked', {
			product_id: product.id,
		} );

		navigateTo( {
			url: getNewPath( {
				installProduct: product.id,
			} ),
		} );
	}

	function shouldShowAddToStore( productToCheck: Product ) {
		if ( ! user || ! productToCheck ) {
			return false;
		}

		if ( ! currentUserCan( 'install_plugins' ) ) {
			return false;
		}

		// This value is sent from the PooCommerce.com API.
		if ( ! productToCheck.isInstallable ) {
			return false;
		}

		if ( productToCheck.type === 'theme' ) {
			return false;
		}

		if ( selectedTab === 'discover' ) {
			return false;
		}

		if (
			productToCheck.slug &&
			isProductInstalled( productToCheck.slug )
		) {
			return false;
		}

		return true;
	}

	const currencyFormats: { [ key: string ]: string } = {
		USD: '$%s',
		AUD: 'A$%s',
		CAD: 'C$%s',
		EUR: '€%s',
		GBP: '£%s',
	};

	const getCurrencyFormat = ( currencyCode: string ) => {
		return currencyFormats[ currencyCode ] || '%s';
	};

	function getPriceLabel(): string {
		if ( product.price === 0 ) {
			return __( 'Free download', 'poocommerce' );
		}

		if ( product.freemium_type === 'primary' ) {
			return __( 'Free plan available', 'poocommerce' );
		}

		return sprintf( getCurrencyFormat( product.currency ), product.price );
	}

	function getPriceSuffix(): string {
		// Paid simple products have a billing period of ''.
		if (
			product.billingPeriodInterval === 1 ||
			product.billingPeriod === ''
		) {
			switch ( product.billingPeriod ) {
				case 'day':
					return __( 'daily', 'poocommerce' );
				case 'week':
					return __( 'weekly', 'poocommerce' );
				case 'month':
					return __( 'monthly', 'poocommerce' );
				case 'year':
				case '':
					return __( 'annually', 'poocommerce' );
				default:
					return '';
			}
		}

		let period;
		switch ( product.billingPeriod ) {
			case 'day':
				period = __( 'days', 'poocommerce' );
				break;
			case 'week':
				period = __( 'weeks', 'poocommerce' );
				break;
			case 'month':
				period = __( 'months', 'poocommerce' );
				break;
			default:
				period = __( 'years', 'poocommerce' );
		}

		return sprintf(
			// translators: %1$d: billing period interval, %2$s: billing period (e.g. days, weeks, months, years)
			__( 'every %1$d %2$s', 'poocommerce' ),
			product.billingPeriodInterval,
			period
		);
	}

	function getBillingText(): string {
		if ( product.freemium_type === 'primary' ) {
			return '';
		}

		if ( product.price !== 0 ) {
			return getPriceSuffix();
		}

		return '';
	}

	const getReaderPriceLabel = () => {
		if ( product.isOnSale ) {
			return sprintf(
				//translators: %1$s is the sale price of the product, %2$s is the regular price of the product, %3$s is the billing period
				__(
					'Sale Price %1$s %3$s, regular price %2$s %3$s',
					'poocommerce'
				),
				getPriceLabel(),
				sprintf(
					getCurrencyFormat( product.currency ),
					product.regularPrice
				),
				getBillingText()
			);
		}

		if ( product.price !== 0 && product.freemium_type !== 'primary' ) {
			return sprintf(
				//translators: %1$s is the price of the product, %2$s is the billing period
				__( ' %1$s, %2$s ', 'poocommerce' ),
				getPriceLabel(),
				getBillingText()
			);
		}

		return getPriceLabel();
	};

	if ( shouldShowAddToStore( product ) ) {
		return (
			<>
				<span className="poocommerce-marketplace__product-card__add-to-store">
					<Button variant="secondary" onClick={ openInstallModal }>
						{ __( 'Add to Store', 'poocommerce' ) }
					</Button>
				</span>
			</>
		);
	}

	return (
		<>
			<div className="poocommerce-marketplace__product-card__price">
				<span className="poocommerce-marketplace__product-card__price-label">
					<span className="screen-reader-text">
						{ getReaderPriceLabel() }
					</span>
					<span aria-hidden>{ getPriceLabel() }</span>
				</span>

				{ product.isOnSale && (
					<span
						className="poocommerce-marketplace__product-card__on-sale"
						aria-hidden
					>
						{ sprintf(
							getCurrencyFormat( product.currency ),
							product.regularPrice
						) }
					</span>
				) }

				<span
					className="poocommerce-marketplace__product-card__price-billing"
					aria-hidden
				>
					{ getBillingText() }
				</span>
			</div>
			<div className="poocommerce-marketplace__product-card__rating">
				{ product.averageRating !== null && (
					<>
						<span className="poocommerce-marketplace__product-card__rating-icon">
							<Icon icon={ 'star-filled' } size={ 16 } />
						</span>
						<span className="poocommerce-marketplace__product-card__rating-average">
							<span aria-hidden>{ product.averageRating }</span>
							<span className="screen-reader-text">
								{ sprintf(
									// translators: %.1f: average rating
									__( '%.1f stars', 'poocommerce' ),
									product.averageRating
								) }
							</span>
						</span>
						<span className="poocommerce-marketplace__product-card__rating-count">
							<span aria-hidden>({ product.reviewsCount })</span>
							<span className="screen-reader-text">
								{ sprintf(
									// translators: %d: rating count
									__( 'from %d reviews', 'poocommerce' ),
									product.reviewsCount
								) }
							</span>
						</span>
					</>
				) }
			</div>
		</>
	);
}

export default ProductCardFooter;

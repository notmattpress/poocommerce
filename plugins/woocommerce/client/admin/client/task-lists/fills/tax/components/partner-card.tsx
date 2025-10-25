/**
 * External dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Bullet } from './bullet';
import './partner-card.scss';

export const PartnerCard = ( {
	name,
	logo,
	description,
	benefits,
	terms,
	actionText,
	onClick,
	isBusy,
	children,
}: {
	name: string;
	logo: string;
	description: string;
	benefits: ( string | JSX.Element )[];
	terms: string | JSX.Element;
	children?: React.ReactNode;
	actionText?: string;
	onClick: () => void;
	isBusy?: boolean;
} ) => {
	return (
		<div className="poocommerce-tax-partner-card">
			<div className="poocommerce-tax-partner-card__logo">
				<img src={ logo } alt={ name } />
			</div>

			<div className="poocommerce-tax-partner-card__description">
				{ description }
			</div>
			<ul className="poocommerce-tax-partner-card__benefits">
				{ benefits.map( ( benefit, i ) => {
					return (
						<li
							className="poocommerce-tax-partner-card__benefit"
							key={ i }
						>
							<span className="poocommerce-tax-partner-card__benefit-bullet">
								<Bullet />
							</span>
							<span className="poocommerce-tax-partner-card__benefit-text">
								{ benefit }
							</span>
						</li>
					);
				} ) }
			</ul>

			<div className="poocommerce-tax-partner-card__action">
				<div className="poocommerce-tax-partner-card__terms">
					{ terms }
				</div>
				{ children ? (
					children
				) : (
					<Button
						isSecondary
						onClick={ onClick }
						isBusy={ isBusy }
						disabled={ isBusy }
					>
						{ actionText }
					</Button>
				) }
			</div>
		</div>
	);
};

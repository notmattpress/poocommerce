/* eslint-disable @poocommerce/dependency-group */
/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getSetting } from '@poocommerce/settings';
import { getNewPath, getPersistedQuery } from '@poocommerce/navigation';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { SiteHub } from '../assembler-hub/site-hub';
import { ADMIN_URL } from '~/utils/admin-settings';

import './style.scss';
import { WooCYSSecondaryButtonSlot } from './secondary-button-slot';
import lessonPlan from '../assets/icons/lesson-plan.js';
import { Icon, brush, tag } from '@wordpress/icons';
import { trackEvent } from '../tracking';
import { isEntrepreneurFlow } from '../entrepreneur-flow';

export * as services from './services';

export const Transitional = () => {
	const homeUrl: string = getSetting( 'homeUrl', '' );
	const adminUrl = getNewPath( getPersistedQuery(), '/', {} );

	return (
		<div className="poocommerce-customize-store__transitional">
			<SiteHub
				isTransparent={ false }
				className="poocommerce-edit-site-layout__hub"
			/>
			<div className="poocommerce-customize-store__transitional-content">
				<h1 className="poocommerce-customize-store__transitional-heading">
					{ __( 'Your store looks great!', 'poocommerce' ) }
				</h1>
				<h2 className="poocommerce-customize-store__transitional-subheading">
					{ isEntrepreneurFlow()
						? __(
								"Congratulations! You've successfully designed your store. Now you can go back to the Home screen to complete your store setup and start selling.",
								'poocommerce'
						  )
						: __(
								"Congratulations! You've successfully designed your store. Take a look at your hard work before continuing to set up your store.",
								'poocommerce'
						  ) }
				</h2>

				<WooCYSSecondaryButtonSlot />
				<div className="poocommerce-customize-store__transitional-buttons">
					<Button
						href={ homeUrl }
						className="poocommerce-customize-store__transitional-preview-button"
						variant={
							isEntrepreneurFlow() ? 'secondary' : 'primary'
						}
						onClick={ () => {
							trackEvent(
								'customize_your_store_transitional_preview_store_click'
							);
						} }
					>
						{ __( 'View store', 'poocommerce' ) }
					</Button>

					{ isEntrepreneurFlow() && (
						<Button
							variant="primary"
							href={ adminUrl }
							onClick={ () => {
								trackEvent(
									'customize_your_store_entrepreneur_home_click'
								);
							} }
						>
							{ __( 'Back to Home', 'poocommerce' ) }
						</Button>
					) }
				</div>
				{ ! isEntrepreneurFlow() && (
					<>
						<h2 className="poocommerce-customize-store__transitional-main-actions-title">
							{ __( "What's next?", 'poocommerce' ) }
						</h2>
						<div className="poocommerce-customize-store__transitional-main-actions">
							<div className="poocommerce-customize-store__transitional-action">
								<Icon
									className={
										'poocommerce-customize-store__transitional-action__icon'
									}
									icon={ tag }
								/>
								<div className="poocommerce-customize-store__transitional-action__content">
									<h3>
										{ __(
											'Add your products',
											'poocommerce'
										) }
									</h3>
									<p>
										{ __(
											'Start stocking your virtual shelves by adding or importing your products, or edit the sample products.',
											'poocommerce'
										) }
									</p>
									<Button
										variant="link"
										href={ `${ ADMIN_URL }edit.php?post_type=product` }
										onClick={ () => {
											trackEvent(
												'customize_your_store_transitional_product_list_click'
											);
										} }
									>
										{ __(
											'Go to Products',
											'poocommerce'
										) }
									</Button>
								</div>
							</div>

							<div className="poocommerce-customize-store__transitional-action">
								<Icon
									className={
										'poocommerce-customize-store__transitional-action__icon'
									}
									icon={ brush }
								/>
								<div className="poocommerce-customize-store__transitional-action__content">
									<h3>
										{ __(
											'Fine-tune your design',
											'poocommerce'
										) }
									</h3>
									<p>
										{ __(
											'Head to the Editor to change your images and text, add more pages, and make any further customizations.',
											'poocommerce'
										) }
									</p>
									<Button
										variant="link"
										href={ `${ ADMIN_URL }site-editor.php` }
										onClick={ () => {
											trackEvent(
												'customize_your_store_transitional_editor_click'
											);
										} }
									>
										{ __(
											'Go to the Editor',
											'poocommerce'
										) }
									</Button>
								</div>
							</div>

							<div className="poocommerce-customize-store__transitional-action">
								<Icon
									className={
										'poocommerce-customize-store__transitional-action__icon'
									}
									icon={ lessonPlan }
								/>
								<div className="poocommerce-customize-store__transitional-action__content">
									<h3>
										{ __(
											'Continue setting up your store',
											'poocommerce'
										) }
									</h3>
									<p>
										{ __(
											'Go back to the Home screen to complete your store setup and start selling',
											'poocommerce'
										) }
									</p>
									<Button
										variant="link"
										href={ adminUrl }
										onClick={ () => {
											trackEvent(
												'customize_your_store_transitional_home_click'
											);
										} }
									>
										{ __( 'Back to Home', 'poocommerce' ) }
									</Button>
								</div>
							</div>
						</div>
					</>
				) }
			</div>
		</div>
	);
};

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { BlockControls } from '@wordpress/block-editor';
import { getAdminLink, getSetting } from '@poocommerce/settings';
import {
	Notice,
	ToggleControl,
	ToolbarGroup,
	RangeControl,
	SelectControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

export const getBlockControls = ( editMode, setAttributes, buttonTitle ) => (
	<BlockControls>
		<ToolbarGroup
			controls={ [
				{
					icon: 'edit',
					title: buttonTitle,
					onClick: () => setAttributes( { editMode: ! editMode } ),
					isActive: editMode,
				},
			] }
		/>
	</BlockControls>
);

export const getSharedReviewContentControls = ( attributes, setAttributes ) => {
	const showAvatars = getSetting( 'showAvatars', true );
	const reviewRatingsEnabled = getSetting( 'reviewRatingsEnabled', true );
	return (
		<>
			<ToggleControl
				label={ __( 'Product rating', 'poocommerce' ) }
				checked={ attributes.showReviewRating }
				onChange={ () =>
					setAttributes( {
						showReviewRating: ! attributes.showReviewRating,
					} )
				}
			/>
			{ attributes.showReviewRating && ! reviewRatingsEnabled && (
				<Notice
					className="wc-block-base-control-notice"
					isDismissible={ false }
				>
					{ createInterpolateElement(
						__(
							'Product rating is disabled in your <a>store settings</a>.',
							'poocommerce'
						),
						{
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-has-content
								<a
									href={ getAdminLink(
										'admin.php?page=wc-settings&tab=products'
									) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						}
					) }
				</Notice>
			) }
			<ToggleControl
				label={ __( 'Reviewer name', 'poocommerce' ) }
				checked={ attributes.showReviewerName }
				onChange={ () =>
					setAttributes( {
						showReviewerName: ! attributes.showReviewerName,
					} )
				}
			/>
			<ToggleControl
				label={ __( 'Image', 'poocommerce' ) }
				checked={ attributes.showReviewImage }
				onChange={ () =>
					setAttributes( {
						showReviewImage: ! attributes.showReviewImage,
					} )
				}
			/>
			<ToggleControl
				label={ __( 'Review date', 'poocommerce' ) }
				checked={ attributes.showReviewDate }
				onChange={ () =>
					setAttributes( {
						showReviewDate: ! attributes.showReviewDate,
					} )
				}
			/>
			<ToggleControl
				label={ __( 'Review content', 'poocommerce' ) }
				checked={ attributes.showReviewContent }
				onChange={ () =>
					setAttributes( {
						showReviewContent: ! attributes.showReviewContent,
					} )
				}
			/>
			{ attributes.showReviewImage && (
				<>
					<ToggleGroupControl
						label={ __( 'Review image', 'poocommerce' ) }
						isBlock
						value={ attributes.imageType }
						onChange={ ( value ) =>
							setAttributes( { imageType: value } )
						}
					>
						<ToggleGroupControlOption
							value="reviewer"
							label={ __( 'Reviewer photo', 'poocommerce' ) }
						/>
						<ToggleGroupControlOption
							value="product"
							label={ __( 'Product', 'poocommerce' ) }
						/>
					</ToggleGroupControl>
					{ attributes.imageType === 'reviewer' && ! showAvatars && (
						<Notice
							className="wc-block-base-control-notice"
							isDismissible={ false }
						>
							{ createInterpolateElement(
								__(
									'Reviewer photo is disabled in your <a>site settings</a>.',
									'poocommerce'
								),
								{
									a: (
										// eslint-disable-next-line jsx-a11y/anchor-has-content
										<a
											href={ getAdminLink(
												'options-discussion.php'
											) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								}
							) }
						</Notice>
					) }
				</>
			) }
		</>
	);
};

export const getSharedReviewListControls = ( attributes, setAttributes ) => {
	const minPerPage = 1;
	const maxPerPage = 20;

	return (
		<>
			<ToggleControl
				label={ __( 'Order by', 'poocommerce' ) }
				checked={ attributes.showOrderby }
				onChange={ () =>
					setAttributes( { showOrderby: ! attributes.showOrderby } )
				}
			/>
			<SelectControl
				label={ __( 'Order Product Reviews by', 'poocommerce' ) }
				value={ attributes.orderby }
				options={ [
					{ label: 'Most recent', value: 'most-recent' },
					{ label: 'Highest Rating', value: 'highest-rating' },
					{ label: 'Lowest Rating', value: 'lowest-rating' },
				] }
				onChange={ ( orderby ) => setAttributes( { orderby } ) }
			/>
			<RangeControl
				label={ __( 'Starting Number of Reviews', 'poocommerce' ) }
				value={ attributes.reviewsOnPageLoad }
				onChange={ ( reviewsOnPageLoad ) =>
					setAttributes( { reviewsOnPageLoad } )
				}
				max={ maxPerPage }
				min={ minPerPage }
			/>
			<ToggleControl
				label={ __( 'Load more', 'poocommerce' ) }
				checked={ attributes.showLoadMore }
				onChange={ () =>
					setAttributes( { showLoadMore: ! attributes.showLoadMore } )
				}
			/>
			{ attributes.showLoadMore && (
				<RangeControl
					label={ __( 'Load More Reviews', 'poocommerce' ) }
					value={ attributes.reviewsOnLoadMore }
					onChange={ ( reviewsOnLoadMore ) =>
						setAttributes( { reviewsOnLoadMore } )
					}
					max={ maxPerPage }
					min={ minPerPage }
				/>
			) }
		</>
	);
};

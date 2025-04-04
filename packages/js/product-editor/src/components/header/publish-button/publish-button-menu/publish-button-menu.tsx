/**
 * External dependencies
 */
import { MenuGroup, MenuItem } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { createElement, Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { ProductStatus } from '@poocommerce/data';
import { getNewPath, navigateTo } from '@poocommerce/navigation';
import { getAdminLink } from '@poocommerce/settings';
import { recordEvent } from '@poocommerce/tracks';

/**
 * Internal dependencies
 */
import { useProductManager } from '../../../../hooks/use-product-manager';
import { useProductScheduled } from '../../../../hooks/use-product-scheduled';
import { recordProductEvent } from '../../../../utils/record-product-event';
import { useErrorHandler } from '../../../../hooks/use-error-handler';
import { ButtonWithDropdownMenu } from '../../../button-with-dropdown-menu';
import { SchedulePublishModal } from '../../../schedule-publish-modal';
import { showSuccessNotice } from '../utils';
import type { PublishButtonMenuProps } from './types';
import { TRACKS_SOURCE } from '../../../../constants';

export function PublishButtonMenu( {
	postType,
	visibleTab = 'general',
	...props
}: PublishButtonMenuProps ) {
	const { isScheduling, isScheduled, schedule, date, formattedDate } =
		useProductScheduled( postType );
	const [ showScheduleModal, setShowScheduleModal ] = useState<
		'schedule' | 'edit' | undefined
	>();
	const { copyToDraft, trash } = useProductManager( postType );
	const { createErrorNotice, createSuccessNotice } =
		useDispatch( 'core/notices' );
	const [ , , prevStatus ] = useEntityProp< ProductStatus >(
		'postType',
		postType,
		'status'
	);
	const { getProductErrorMessageAndProps } = useErrorHandler();

	function scheduleProduct( dateString?: string ) {
		schedule( dateString )
			.then( ( scheduledProduct ) => {
				recordProductEvent( 'product_schedule', scheduledProduct );

				showSuccessNotice( scheduledProduct );
			} )
			.catch( async ( error ) => {
				const { message, errorProps } =
					await getProductErrorMessageAndProps( error, visibleTab );
				createErrorNotice( message, errorProps );
			} )
			.finally( () => {
				setShowScheduleModal( undefined );
			} );
	}

	function renderSchedulePublishModal() {
		return (
			showScheduleModal && (
				<SchedulePublishModal
					postType={ postType }
					value={ showScheduleModal === 'edit' ? date : undefined }
					isScheduling={ isScheduling }
					onCancel={ () => setShowScheduleModal( undefined ) }
					onSchedule={ scheduleProduct }
				/>
			)
		);
	}

	function renderMenu( { onClose }: { onClose?: () => void } ) {
		return (
			<>
				<MenuGroup>
					{ isScheduled ? (
						<>
							<MenuItem
								onClick={ () => {
									scheduleProduct();
									if ( onClose ) {
										onClose();
									}
								} }
							>
								{ __( 'Publish now', 'poocommerce' ) }
							</MenuItem>
							<MenuItem
								info={ formattedDate }
								onClick={ () => {
									setShowScheduleModal( 'edit' );
									if ( onClose ) {
										onClose();
									}
								} }
							>
								{ __( 'Edit schedule', 'poocommerce' ) }
							</MenuItem>
						</>
					) : (
						<MenuItem
							onClick={ () => {
								recordEvent( 'product_schedule_publish', {
									source: TRACKS_SOURCE,
								} );
								setShowScheduleModal( 'schedule' );
								if ( onClose ) {
									onClose();
								}
							} }
						>
							{ __( 'Schedule publish', 'poocommerce' ) }
						</MenuItem>
					) }
				</MenuGroup>

				{ prevStatus !== 'trash' && (
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								copyToDraft()
									.then( ( duplicatedProduct ) => {
										recordProductEvent(
											'product_copied_to_draft',
											duplicatedProduct
										);
										createSuccessNotice(
											__(
												'Product successfully duplicated',
												'poocommerce'
											)
										);
										const url = getNewPath(
											{},
											`/product/${ duplicatedProduct.id }`
										);
										navigateTo( { url } );
									} )
									.catch( async ( error ) => {
										const { message, errorProps } =
											await getProductErrorMessageAndProps(
												error,
												visibleTab
											);
										createErrorNotice(
											message,
											errorProps
										);
									} );
								if ( onClose ) {
									onClose();
								}
							} }
						>
							{ __( 'Copy to a new draft', 'poocommerce' ) }
						</MenuItem>
						<MenuItem
							isDestructive
							onClick={ () => {
								trash()
									.then( ( deletedProduct ) => {
										recordProductEvent(
											'product_delete',
											deletedProduct
										);
										createSuccessNotice(
											__(
												'Product successfully deleted',
												'poocommerce'
											)
										);
										const productListUrl = getAdminLink(
											'edit.php?post_type=product'
										);
										navigateTo( {
											url: productListUrl,
										} );
									} )
									.catch( async ( error ) => {
										const { message, errorProps } =
											await getProductErrorMessageAndProps(
												error,
												visibleTab
											);
										createErrorNotice(
											message,
											errorProps
										);
									} );
								if ( onClose ) {
									onClose();
								}
							} }
						>
							{ __( 'Move to trash', 'poocommerce' ) }
						</MenuItem>
					</MenuGroup>
				) }
			</>
		);
	}

	return (
		<>
			<ButtonWithDropdownMenu
				{ ...props }
				onToggle={ ( isOpen ) => {
					if ( isOpen ) {
						recordEvent( 'product_publish_dropdown_open', {
							source: TRACKS_SOURCE,
						} );
					}
					props.onToggle?.( isOpen );
				} }
				renderMenu={ renderMenu }
			/>

			{ renderSchedulePublishModal() }
		</>
	);
}

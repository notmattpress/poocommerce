/**
 * External dependencies
 */
import clsx from 'clsx';
import { useEffect, useState } from '@wordpress/element';
import { EllipsisMenu } from '@poocommerce/components';
import { recordEvent } from '@poocommerce/tracks';
import { useDispatch, useSelect } from '@wordpress/data';
import { OPTIONS_STORE_NAME, WCDataSelector, WEEK } from '@poocommerce/data';
import { Button, Card, CardHeader } from '@wordpress/components';
import { Text } from '@poocommerce/experimental';
import {
	ADMIN_INSTALL_TIMESTAMP_OPTION_NAME,
	ALLOW_TRACKING_OPTION_NAME,
	CustomerFeedbackModal,
	CustomerFeedbackSimple,
	SHOWN_FOR_ACTIONS_OPTION_NAME,
} from '@poocommerce/customer-effort-score';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './task-list-completed-header.scss';
import HeaderImage from '../assets/completed-celebration-header.svg';

type TaskListCompletedHeaderProps = {
	hideTasks: () => void;
	customerEffortScore: boolean;
};

const CUSTOMER_EFFORT_SCORE_ACTION = 'store_setup';

function getStoreAgeInWeeks( adminInstallTimestamp: number ) {
	if ( adminInstallTimestamp === 0 ) {
		return null;
	}

	// Date.now() is ms since Unix epoch, adminInstallTimestamp is in
	// seconds since Unix epoch.
	const storeAgeInMs = Date.now() - adminInstallTimestamp * 1000;
	const storeAgeInWeeks = Math.round( storeAgeInMs / WEEK );

	return storeAgeInWeeks;
}

export const TaskListCompletedHeader: React.FC<
	TaskListCompletedHeaderProps
> = ( { hideTasks, customerEffortScore } ) => {
	const { updateOptions } = useDispatch( OPTIONS_STORE_NAME );
	const [ showCesModal, setShowCesModal ] = useState( false );
	const [ hasSubmittedScore, setHasSubmittedScore ] = useState( false );
	const [ score, setScore ] = useState( NaN );
	const [ hideCustomerEffortScore, setHideCustomerEffortScore ] =
		useState( false );
	const { storeAgeInWeeks, cesShownForActions, canShowCustomerEffortScore } =
		useSelect( ( select: WCDataSelector ) => {
			const { getOption, hasFinishedResolution } =
				select( OPTIONS_STORE_NAME );

			if ( customerEffortScore ) {
				const allowTracking = getOption( ALLOW_TRACKING_OPTION_NAME );
				const adminInstallTimestamp: number =
					getOption( ADMIN_INSTALL_TIMESTAMP_OPTION_NAME ) || 0;
				const cesActions = getOption< string[] >(
					SHOWN_FOR_ACTIONS_OPTION_NAME
				);
				const loadingOptions =
					! hasFinishedResolution( 'getOption', [
						SHOWN_FOR_ACTIONS_OPTION_NAME,
					] ) ||
					! hasFinishedResolution( 'getOption', [
						ADMIN_INSTALL_TIMESTAMP_OPTION_NAME,
					] );
				return {
					storeAgeInWeeks: getStoreAgeInWeeks(
						adminInstallTimestamp
					),
					cesShownForActions: cesActions,
					canShowCustomerEffortScore:
						! loadingOptions &&
						allowTracking &&
						! ( cesActions || [] ).includes( 'store_setup' ),
					loading: loadingOptions,
				};
			}
			return {};
		} );

	useEffect( () => {
		if ( hasSubmittedScore ) {
			setTimeout( () => {
				setHideCustomerEffortScore( true );
			}, 1200 );
		}
	}, [ hasSubmittedScore ] );

	const submitScore = ( {
		firstScore,
		secondScore,
		comments,
	}: {
		firstScore: number;
		secondScore?: number;
		comments?: string;
	} ) => {
		recordEvent( 'ces_feedback', {
			action: CUSTOMER_EFFORT_SCORE_ACTION,
			score: firstScore,
			score_second_question: secondScore ?? null,
			score_combined: firstScore + ( secondScore ?? 0 ),
			comments: comments || '',
			store_age: storeAgeInWeeks,
		} );
		updateOptions( {
			[ SHOWN_FOR_ACTIONS_OPTION_NAME ]: [
				CUSTOMER_EFFORT_SCORE_ACTION,
				...( cesShownForActions || [] ),
			],
		} );
		setHasSubmittedScore( true );
	};

	const recordScore = ( recordedScore: number ) => {
		if ( recordedScore > 2 ) {
			setScore( recordedScore );
			submitScore( { firstScore: recordedScore } );
		} else {
			setScore( recordedScore );
			setShowCesModal( true );
			recordEvent( 'ces_view', {
				action: CUSTOMER_EFFORT_SCORE_ACTION,
				store_age: storeAgeInWeeks,
			} );
		}
	};

	const recordModalScore = (
		firstScore: number,
		secondScore: number,
		comments: string
	) => {
		setShowCesModal( false );
		submitScore( { firstScore, secondScore, comments } );
	};

	return (
		<>
			<div
				className={ clsx(
					'poocommerce-task-dashboard__container setup-task-list'
				) }
			>
				<Card
					size="large"
					className="poocommerce-task-card poocommerce-homescreen-card completed"
				>
					<CardHeader size="medium">
						<div className="poocommerce-task-card__header">
							<img
								src={ HeaderImage }
								alt="Completed"
								className="poocommerce-task-card__finished-header-image"
							/>

							<Text size="title" as="h2" lineHeight={ 1.4 }>
								{ __(
									'You’ve completed store setup',
									'poocommerce'
								) }
							</Text>
							<Text
								variant="subtitle.small"
								as="p"
								size="13"
								lineHeight="16px"
								className="poocommerce-task-card__header-subtitle"
							>
								{ __(
									'Congratulations! Take a moment to celebrate and look out for the first sale.',
									'poocommerce'
								) }
							</Text>
							<div className="poocommerce-task-card__header-menu">
								<EllipsisMenu
									label={ __(
										'Task List Options',
										'poocommerce'
									) }
									renderContent={ () => (
										<div className="poocommerce-task-card__section-controls">
											<Button
												onClick={ () => hideTasks() }
											>
												{ __(
													'Hide this',
													'poocommerce'
												) }
											</Button>
										</div>
									) }
								/>
							</div>
						</div>
					</CardHeader>
					{ canShowCustomerEffortScore &&
						! hideCustomerEffortScore &&
						! hasSubmittedScore && (
							<CustomerFeedbackSimple
								label={ __(
									'How was your experience?',
									'poocommerce'
								) }
								onSelect={ recordScore }
							/>
						) }
					{ hasSubmittedScore && ! hideCustomerEffortScore && (
						<div className="poocommerce-task-card__header-ces-feedback">
							<Text
								variant="subtitle.small"
								as="p"
								size="13"
								lineHeight="16px"
							>
								🙌{ ' ' }
								{ __(
									'We appreciate your feedback!',
									'poocommerce'
								) }
							</Text>
						</div>
					) }
				</Card>
			</div>
			{ showCesModal ? (
				<CustomerFeedbackModal
					title={ __( 'How was your experience?', 'poocommerce' ) }
					firstQuestion={ __(
						'The store setup is easy to complete.',
						'poocommerce'
					) }
					secondQuestion={ __(
						'The store setup process meets my needs.',
						'poocommerce'
					) }
					defaultScore={ score }
					recordScoreCallback={ recordModalScore }
					onCloseModal={ () => {
						setScore( NaN );
						setShowCesModal( false );
					} }
				/>
			) : null }
		</>
	);
};

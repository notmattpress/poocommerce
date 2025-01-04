/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, CheckboxControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import interpolateComponents from '@automattic/interpolate-components';
import { Link } from '@poocommerce/components';

/**
 * Internal dependencies
 */
import { IntroOptInEvent } from '../events';
import { Heading } from '../components/heading/heading';
import { Navigation } from '../components/navigation/navigation';
import { CoreProfilerStateMachineContext } from '..';

export const IntroOptIn = ( {
	sendEvent,
	navigationProgress,
	context,
}: {
	sendEvent: ( event: IntroOptInEvent ) => void;
	navigationProgress: number;
	context: Pick<
		CoreProfilerStateMachineContext,
		'optInDataSharing' | 'userProfile' | 'coreProfilerCompletedSteps'
	>;
} ) => {
	const hasCompletedIntroOptInPreviously =
		context.userProfile?.completed ||
		context.userProfile?.skipped ||
		context.coreProfilerCompletedSteps?.[ 'intro-opt-in' ];
	const optInCheckboxInitialStatus =
		( hasCompletedIntroOptInPreviously && context.optInDataSharing ) ||
		! hasCompletedIntroOptInPreviously;

	const [ iOptInDataSharing, setIsOptInDataSharing ] = useState< boolean >(
		optInCheckboxInitialStatus
	);

	// we want the checkbox to be checked if
	// 1. the user has previously completed the profiler and opted in
	//  1a. the user has completed the intro-opt-in step previously and opted in
	// 2. the user has not previously completed the profiler
	// conversely, the checkbox should be unchecked if
	// 1. the user has previously completed the profiler and opted out
	//  1a. the user has completed the intro-opt-in step previously and opted out
	// a user has completed the profiler if context.userProfile.completed is true or
	// context.userProfile.skipped is true

	return (
		<div
			className="poocommerce-profiler-intro-opt-in"
			data-testid="core-profiler-intro-opt-in-screen"
		>
			<Navigation percentage={ navigationProgress } />
			<div className="poocommerce-profiler-page__content poocommerce-profiler-intro-opt-in__content">
				<div className="poocommerce-profiler-welcome-image" />
				<Heading
					title={ __( 'Welcome to Woo!', 'poocommerce' ) }
					subTitle={ interpolateComponents( {
						mixedString: __(
							'It’s great to have you here with us! We’ll be guiding you through the setup process – first, answer a few questions to tailor your experience.',
							'poocommerce'
						),
						components: {
							br: <br />,
						},
					} ) }
				/>
				<Button
					className="poocommerce-profiler-setup-store__button"
					variant="primary"
					onClick={ () =>
						sendEvent( {
							type: 'INTRO_COMPLETED',
							payload: { optInDataSharing: iOptInDataSharing },
						} )
					}
				>
					{ __( 'Set up my store', 'poocommerce' ) }
				</Button>
				<Button
					className="poocommerce-profiler-setup-store__button"
					variant="tertiary"
					onClick={ () =>
						sendEvent( {
							type: 'INTRO_SKIPPED',
							payload: { optInDataSharing: iOptInDataSharing },
						} )
					}
				>
					{ __( 'Skip guided setup', 'poocommerce' ) }
				</Button>
				<div className="poocommerce-profiler-intro-opt-in__footer">
					<CheckboxControl
						className="core-profiler__checkbox"
						label={ interpolateComponents( {
							mixedString: __(
								'I agree to share my data to tailor my store setup experience, get more relevant content, and help make PooCommerce better for everyone. You can opt out at any time in PooCommerce settings. {{link}}Learn more about usage tracking.{{/link}}',
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
						checked={ iOptInDataSharing }
						onChange={ setIsOptInDataSharing }
					/>
				</div>
			</div>
		</div>
	);
};

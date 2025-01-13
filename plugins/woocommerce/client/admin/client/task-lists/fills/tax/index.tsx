/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Card, CardBody, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { getAdminLink } from '@poocommerce/settings';
import {
	OPTIONS_STORE_NAME,
	SETTINGS_STORE_NAME,
	TaskType,
} from '@poocommerce/data';
import { queueRecordEvent, recordEvent } from '@poocommerce/tracks';
import { registerPlugin } from '@wordpress/plugins';
import {
	useCallback,
	useEffect,
	useState,
	createElement,
	useMemo,
} from '@wordpress/element';
import { WooOnboardingTask } from '@poocommerce/onboarding';

/**
 * Internal dependencies
 */
import { redirectToTaxSettings } from './utils';
import { Card as PooCommerceTaxCard } from './poocommerce-tax/card';
import { Card as StripeTaxCard } from './stripe-tax/card';
import { createNoticesFromResponse } from '../../../lib/notices';
import { getCountryCode } from '~/dashboard/utils';
import { ManualConfiguration } from './manual-configuration';
import { Partners } from './components/partners';
import { PooCommerceTax } from './poocommerce-tax';

const TaskCard: React.FC = ( { children } ) => {
	return (
		<Card className="poocommerce-task-card">
			<CardBody>{ children }</CardBody>
		</Card>
	);
};

export type TaxProps = {
	onComplete: () => void;
	query: Record< string, string >;
	task: TaskType;
};

export const Tax: React.FC< TaxProps > = ( { onComplete, query, task } ) => {
	const [ isPending, setIsPending ] = useState( false );
	const { updateOptions } = useDispatch( OPTIONS_STORE_NAME );
	const { createNotice } = useDispatch( 'core/notices' );
	const { updateAndPersistSettingsForGroup } =
		useDispatch( SETTINGS_STORE_NAME );
	const { generalSettings, isResolving, taxSettings } = useSelect(
		( select ) => {
			const { getSettings, hasFinishedResolution } =
				select( SETTINGS_STORE_NAME );
			return {
				generalSettings: getSettings( 'general' ).general,
				isResolving: ! hasFinishedResolution( 'getSettings', [
					'general',
				] ),
				taxSettings: getSettings( 'tax' ).tax || {},
			};
		}
	);

	const onManual = useCallback( async () => {
		setIsPending( true );
		if ( generalSettings?.poocommerce_calc_taxes !== 'yes' ) {
			updateAndPersistSettingsForGroup( 'tax', {
				tax: {
					...taxSettings,
					wc_connect_taxes_enabled: 'no',
				},
			} );
			updateAndPersistSettingsForGroup( 'general', {
				general: {
					...generalSettings,
					poocommerce_calc_taxes: 'yes',
				},
			} )
				.then( () => redirectToTaxSettings() )
				.catch( ( error: unknown ) => {
					setIsPending( false );
					createNoticesFromResponse( error );
				} );
		} else {
			redirectToTaxSettings();
		}
	}, [ generalSettings, taxSettings, updateAndPersistSettingsForGroup ] );

	const onAutomate = useCallback( async () => {
		setIsPending( true );
		try {
			await Promise.all( [
				updateAndPersistSettingsForGroup( 'tax', {
					tax: {
						...taxSettings,
						wc_connect_taxes_enabled: 'yes',
					},
				} ),
				updateAndPersistSettingsForGroup( 'general', {
					general: {
						...generalSettings,
						poocommerce_calc_taxes: 'yes',
					},
				} ),
			] );
		} catch ( error: unknown ) {
			setIsPending( false );
			createNotice(
				'error',
				__(
					'There was a problem setting up automated taxes. Please try again.',
					'poocommerce'
				)
			);
			return;
		}

		createNotice(
			'success',
			__(
				'You’re awesome! One less item on your to-do list ✅',
				'poocommerce'
			)
		);
		onComplete();
	}, [
		createNotice,
		generalSettings,
		onComplete,
		taxSettings,
		updateAndPersistSettingsForGroup,
	] );

	const onDisable = useCallback( () => {
		setIsPending( true );
		queueRecordEvent( 'tasklist_tax_connect_store', {
			connect: false,
			no_tax: true,
		} );

		updateOptions( {
			poocommerce_no_sales_tax: true,
			poocommerce_calc_taxes: 'no',
		} ).then( () => {
			window.location.href = getAdminLink( 'admin.php?page=wc-admin' );
		} );
	}, [ updateOptions ] );

	const partners = useMemo( () => {
		const countryCode =
			getCountryCode( generalSettings?.poocommerce_default_country ) ||
			'';
		const {
			additionalData: {
				poocommerceTaxCountries = [],
				stripeTaxCountries = [],
				taxJarActivated,
				poocommerceTaxActivated,
				poocommerceShippingActivated,
			} = {},
		} = task;

		const allPartners = [
			{
				id: 'poocommerce-tax',
				card: PooCommerceTaxCard,
				component: PooCommerceTax,
				isVisible:
					! taxJarActivated && // WCS integration doesn't work with the official TaxJar plugin.
					! poocommerceTaxActivated &&
					! poocommerceShippingActivated &&
					poocommerceTaxCountries.includes( countryCode ),
			},
			{
				id: 'stripe-tax',
				card: StripeTaxCard,

				isVisible: stripeTaxCountries.includes( countryCode ),
			},
		];

		return allPartners.filter( ( partner ) => partner.isVisible );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- the partner list shouldn't be changing in the middle of interaction. for some reason the country is becoming null in a re-render and causing unexpected behaviour
	}, [] );

	const { auto } = query;
	useEffect( () => {
		if ( auto === 'true' ) {
			onAutomate();
		}
	}, [ auto, onAutomate ] );

	useEffect( () => {
		if ( query.partner ) {
			return;
		}
		recordEvent( 'tasklist_tax_view_options', {
			options: partners.map( ( partner ) => partner.id ),
		} );
	}, [ partners, query.partner ] );

	const currentPartner = useMemo( () => {
		if ( ! query.partner ) {
			return null;
		}

		return (
			partners.find( ( partner ) => partner.id === query.partner ) || null
		);
	}, [ partners, query.partner ] );

	const childProps = {
		isPending,
		onAutomate,
		onManual,
		onDisable,
		task,
	};

	if ( isResolving ) {
		return <Spinner />;
	}

	if ( ! partners.length ) {
		return (
			<TaskCard>
				<ManualConfiguration { ...childProps } />
			</TaskCard>
		);
	}

	if ( currentPartner ) {
		return (
			<TaskCard>
				{ currentPartner.component &&
					createElement( currentPartner.component, childProps ) }
			</TaskCard>
		);
	}
	return (
		<Partners { ...childProps }>
			{ partners.map(
				( partner ) =>
					partner.card &&
					createElement( partner.card, {
						key: partner.id,
						...childProps,
					} )
			) }
		</Partners>
	);
};

registerPlugin( 'wc-admin-onboarding-task-tax', {
	scope: 'poocommerce-tasks',
	render: () => (
		<WooOnboardingTask id="tax">
			{ ( { onComplete, query, task }: TaxProps ) => (
				<Tax onComplete={ onComplete } query={ query } task={ task } />
			) }
		</WooOnboardingTask>
	),
} );

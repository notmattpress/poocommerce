/**
 * External dependencies
 */
import {
	checkoutRef,
	sparseCheckoutRepo,
} from '@poocommerce/monorepo-utils/src/core/git';
import { readFile } from 'fs/promises';
import { join } from 'path';
import semver from 'semver';

/**
 * Internal dependencies
 */
import { ContributorData, getContributorData } from './github-api';

const OTHER_WATCHED_PACKAGES = [
	{
		displayName: 'ActionScheduler',
		packagist: 'poocommerce/action-scheduler',
		org: 'poocommerce',
		repo: 'action-scheduler',
		versionPrefix: '',
	},
];

export const generateContributors = async (
	currentVersion: string,
	previousVersion: string
) => {
	const repoPath = await sparseCheckoutRepo(
		'https://github.com/poocommerce/poocommerce.git',
		'poocommerce',
		[ 'plugins/poocommerce' ]
	);

	await checkoutRef( repoPath, currentVersion );

	const currentComposer = JSON.parse(
		await readFile(
			join( repoPath, 'plugins/poocommerce/composer.json' ),
			'utf-8'
		)
	);

	await checkoutRef( repoPath, previousVersion.toString() );

	const previousComposer = JSON.parse(
		await readFile(
			join( repoPath, 'plugins/poocommerce/composer.json' ),
			'utf-8'
		)
	);

	const currentRequire = currentComposer.require;
	const previousRequire = previousComposer.require;

	const coreContributors = await getContributorData(
		'poocommerce',
		'poocommerce',
		previousVersion,
		currentVersion
	);

	const dependencyContributors: Record< string, ContributorData > = {};

	for ( const pkg of OTHER_WATCHED_PACKAGES ) {
		const currentPkgVersion = currentRequire[ pkg.packagist ];
		const previousPkgVersion = previousRequire[ pkg.packagist ];
		if (
			currentPkgVersion &&
			previousPkgVersion &&
			semver.gt( currentPkgVersion, previousPkgVersion )
		) {
			dependencyContributors[ pkg.displayName ] =
				await getContributorData(
					pkg.org,
					pkg.repo,
					`${ pkg.versionPrefix }${ previousPkgVersion }`,
					`${ pkg.versionPrefix }${ currentPkgVersion }`
				);
		}
	}

	return {
		'PooCommerce Core': coreContributors,
		ActionScheduler: dependencyContributors.ActionScheduler || [],
		'PooCommerce Blocks':
			dependencyContributors[ 'PooCommerce Blocks' ] || [],
	};
};

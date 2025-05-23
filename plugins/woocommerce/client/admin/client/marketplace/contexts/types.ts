/**
 * External dependencies
 */
import type { Options } from 'wordpress__notices';

/**
 * Internal dependencies
 */
import { Subscription } from '../components/my-subscriptions/types';

export interface SearchResultsCountType {
	extensions: number;
	themes: number;
	'business-services': number;
}

export type MarketplaceContextType = {
	isLoading: boolean;
	setIsLoading: ( isLoading: boolean ) => void;
	selectedTab: string;
	setSelectedTab: ( tab: string ) => void;
	isProductInstalled: ( slug: string ) => boolean;
	addInstalledProduct: ( slug: string ) => void;
	searchResultsCount: SearchResultsCountType;
	setSearchResultsCount: (
		updatedCounts: Partial< SearchResultsCountType >
	) => void;
	iamSettings: {
		product_previews?: 'modal' | 'none';
	};
};

export type SubscriptionsContextType = {
	subscriptions: Subscription[];
	setSubscriptions: ( subscriptions: Subscription[] ) => void;
	loadSubscriptions: ( toggleLoading?: boolean ) => Promise< void >;
	refreshSubscriptions: ( toggleLoading?: boolean ) => Promise< void >;
	isLoading: boolean;
	setIsLoading: ( isLoading: boolean ) => void;
};

export enum NoticeStatus {
	Success = 'success',
	Error = 'error',
}

export interface Notice {
	productKey: string;
	message: string;
	status: NoticeStatus;
	options?: Partial< Options > | undefined;
}

export interface NoticeState {
	notices: {
		[ key: string ]: Notice;
	};
}

export interface InstallingState {
	installingProducts: string[];
}

/**
 * External dependencies
 */
import { TaskType } from '@poocommerce/data';

export type TaskProps = {
	onComplete: () => void;
	query: Record< string, string >;
	task: TaskType;
};

export type ShippingRecommendationProps = {
	activePlugins: string[];
	isJetpackConnected: boolean;
	isResolving: boolean;
};

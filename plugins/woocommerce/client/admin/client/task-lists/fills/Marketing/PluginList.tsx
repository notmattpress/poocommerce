/**
 * External dependencies
 */
import { Text } from '@poocommerce/experimental';

/**
 * Internal dependencies
 */
import { Plugin, PluginProps } from './Plugin';
import './PluginList.scss';

export type PluginListProps = {
	currentPlugin?: string | null;
	key?: string;
	installAndActivate?: ( slug: string ) => void;
	onManage?: ( slug: string ) => void;
	plugins?: PluginProps[];
	title?: string;
};

export const PluginList = ( {
	currentPlugin,
	installAndActivate = () => {},
	onManage = () => {},
	plugins = [],
	title,
}: PluginListProps ) => {
	return (
		<div className="poocommerce-plugin-list">
			{ title && (
				<div className="poocommerce-plugin-list__title">
					<Text variant="sectionheading" as="h3">
						{ title }
					</Text>
				</div>
			) }
			{ plugins.map( ( plugin ) => {
				const {
					description,
					imageUrl,
					isActive,
					isBuiltByWC,
					isInstalled,
					manageUrl,
					slug,
					name,
					tags,
					learnMoreLink,
					installExternal,
				} = plugin;
				return (
					<Plugin
						key={ slug }
						description={ description }
						manageUrl={ manageUrl }
						name={ name }
						imageUrl={ imageUrl }
						installAndActivate={ installAndActivate }
						onManage={ onManage }
						isActive={ isActive }
						isBuiltByWC={ isBuiltByWC }
						isBusy={ currentPlugin === slug }
						isDisabled={ !! currentPlugin }
						isInstalled={ isInstalled }
						slug={ slug }
						tags={ tags }
						learnMoreLink={ learnMoreLink }
						installExternal={ installExternal }
					/>
				);
			} ) }
		</div>
	);
};

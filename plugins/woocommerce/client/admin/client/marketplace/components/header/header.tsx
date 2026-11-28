/**
 * Internal dependencies
 */
import './header.scss';
import HeaderTitle from '../header-title/header-title';
import HeaderAccount from '../header-account/header-account';
import Tabs from '../tabs/tabs';
import Search from '../search/search';

export default function Header() {
	return (
		<div className="poocommerce-marketplace__header-container">
			<header className="poocommerce-marketplace__header">
				<HeaderTitle />
				<Tabs
					additionalClassNames={ [
						'poocommerce-marketplace__header-tabs',
					] }
				/>
				<Search />
				<div className="poocommerce-marketplace__header-meta">
					<HeaderAccount page="wc-addons" />
				</div>
			</header>
		</div>
	);
}

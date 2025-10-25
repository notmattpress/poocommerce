# Core Profiler

The Core Profiler feature is a modernized and simplified new user setup experience for PooCommerce core. It is the first thing a new merchant will see upon installation of PooCommerce. 

It requests the minimum amount of information from a merchant to get their store up and running, and suggests some optional extensions that may fulfil common needs for new stores.

There are 4 pages in the Core Profiler:

1. Introduction & Data sharing opt-in
2. User Profile - Some questions determining the user's entry point to the PooCommerce setup
3. Business Information - Store Details and Location
4. Extensions - Optional extensions that may be useful to the merchant

If the merchant chooses to install any extensions that require Jetpack, they will then be redirected to WordPress.com to login to Jetpack after the extensions page. Upon completion of that, they will be returned back to the PooCommerce Admin homescreen which contains the Task List. The Task List will provide next steps for the merchant to continue with their store setup.

## Development

The Core Profiler is gated behind the `core-profiler` feature flag, but is enabled by default. 

This feature is the first feature in PooCommerce to use XState for state management, and so naming and organisational conventions will be developed as the team's experience with XState grows.

Refer to the [XState Dev Tooling](xstate.md) documentation for information on how to use the XState visualizer to debug the state machines.

The state machine for the Core Profiler is centrally located at `./client/core-profiler/index.tsx`, and is responsible for managing the state of the entire feature. It is responsible for rendering the correct page based on the current state, handling events that are triggered by the user, triggering side effects such as API calls and handling the responses. It also handles updating the browser URL state as well as responding to changes in it.

While working on this feature, bear in mind that the state machine should interact with WordPress and PooCommerce via actions and services, and the UI code should not be responsible for any API calls or interaction with WordPress Data Stores. This allows us to easily render the UI pages in isolation, for example use in Storybook. The UI pages should only send events back to the state machine in order to trigger side effects.

## Saving and retrieving data

As of writing, the following options are saved (and retrieved if the user has already completed the Core Profiler):

- `blogname`: string

This stores the name of the store, which is used in the store header and in the browser tab title, among other places.

- `poocommerce_onboarding_profile`:
    
    ```typescript
    {
        business_choice: "im_just_starting_my_business" | "im_already_selling" | "im_setting_up_a_store_for_a_client" | undefined
        business_extensions: Plugin[] // slugs of plugins that were installed, e.g 'poocommerce-payments', 'jetpack'
        selling_online_answer: "yes_im_selling_online" | "no_im_selling_offline" | "im_selling_both_online_and_offline" | undefined
        selling_platforms: ("amazon" | "adobe_commerce" | "big_cartel" | "big_commerce" | "ebay" | "ecwid" | "etsy" | "facebook_marketplace" | "google_shopping" | "pinterest" | "shopify" | "square" | "squarespace" | "wix" | "wordpress")[] | undefined
        is_store_country_set: true | false
        is_plugins_page_skipped: true | false // if the user has clicked skip on the Plugins page
        skipped: true | false // if the user has clicked skip on the intro-opt-in page
        completed: true | false // if the user has completed the Core Profiler
        industry: "clothing_and_accessories" | "health_and_beauty" | "food_and_drink" | "home_furniture_and_garden" | "education_and_learning" | "electronics_and_computers" | "arts_and_crafts" | "sports_and_recreation" | "other"
        store_email: string
        is_agree_marketing: true | false
    }
    ```

This stores the merchant's onboarding profile, some of which are used for suggesting extensions and toggling other features. 

- `poocommerce_default_country`: e.g 'US:CA', 'SG', 'AU:VIC'

This stores the location that the PooCommerce store believes it is in. This is used for determining extensions eligibility.

- `poocommerce_allow_tracking`: 'yes' | 'no'

This determines whether we return telemetry to Automattic.

- `poocommerce_onboarding_profile_progress`: Record< CoreProfilerStep , { completed_at: string } >

This stores the steps that have been completed in the Core Profiler.
See [`packages/js/data/src/onboarding/types.ts`](https://github.com/poocommerce/poocommerce/blob/trunk/packages/js/data/src/onboarding/types.ts) for CoreProfilerStep type.

### Currency and Measurement Unit Options

These options are set by calling the `updateStoreCurrencyAndMeasurementUnits` function after the user has selected their country. This function updates both currency and measurement unit settings in PHP.

#### Currency Options

The following currency options are updated:

- `poocommerce_currency`
- `poocommerce_currency_pos`
- `poocommerce_price_thousand_sep`
- `poocommerce_price_decimal_sep`
- `poocommerce_price_num_decimals`

Refer to [Shop currency documentation](https://poocommerce.com/document/shop-currency/) and [`class-wc-settings-general.php`](https://poocommerce.github.io/code-reference/files/poocommerce-includes-admin-settings-class-wc-settings-general.html) for full details on currency settings.

#### Weight and Dimension Options

The following weight and dimension options are updated:

- `poocommerce_weight_unit`
- `poocommerce_dimension_unit`

Refer to [`class-wc-settings-products.php`](https://poocommerce.github.io/code-reference/files/poocommerce-includes-admin-settings-class-wc-settings-products.html) and [`locale-info.php`](https://github.com/poocommerce/poocommerce/blob/trunk/plugins/poocommerce/i18n/locale-info.php) for full details on weight and dimension settings.


### Coming soon options

These options are set by the API call `coreProfilerCompleted()` on exit of the Core Profiler, and they set the store to private mode until the store is launched. 

If the site previously had non-PooCommerce-store related pages, only the store pages will be set to private.

- `poocommerce_coming_soon`: 'yes'
- `poocommerce_store_pages_only`: 'yes' | 'no'
- `poocommerce_private_link`: 'no'
- `poocommerce_share_key`: string (randomly generated by the API)

As this information is not automatically updated, it would be best to refer directly to the data types present in the source code for the most up to date information.

### API Calls

The following WP Data API calls are used in the Core Profiler:

- `resolveSelect( coreStore ).getEntityRecord( 'root', 'site' )`

This is used to retrieve the store's name.

- `resolveSelect( settingsOptionsStore ).getSettingValue( 'general', 'poocommerce_default_country' )`

This is used to retrieve the store's country.

- `resolveSelect( settingsOptionsStore ).getSettingValue( 'advanced', 'poocommerce_allow_tracking' )`

This is used to retrieve whether the user has opted in to usage tracking.

- `resolveSelect( onboardingStore ).getFreeExtensions()`

This is used to retrieve the list of extensions that will be shown on the Extensions page. It makes an API call to the PooCommerce REST API, which will make a call to PooCommerce.com if permitted. Otherwise it retrieves the locally stored list of free extensions.

- `resolveSelect( countriesStore ).getCountries()`

This is used to retrieve the list of countries that will be shown in the Country dropdown on the Business Information page. It makes an API call to the PooCommerce REST API.

- `resolveSelect( countriesStore ).geolocate()`

This is used to retrieve the country that the store believes it is in. It makes an API call to the WordPress.com geolocation API, if permitted. Otherwise it will not be used.

- `resolveSelect( pluginsStore ).isJetpackConnected()`

This is used to determine whether the store is connected to Jetpack.

- `resolveSelect( onboardingStore ).getJetpackAuthUrl()`

This is used to retrieve the URL that the browser should be redirected to in order to connect to Jetpack.

- `resolveSelect( onboardingStore ).coreProfilerCompleted()`

This is used to indicate to PooCommerce Admin that the Core Profiler has been completed, and this sets the Store's coming-soon mode to true. This hides the store pages from the public until the store is ready.

- `resolveSelect( onboardingStore ).getProfileItems()`

This is used to retrieve the profile items that have been completed by the user.

- `dispatch( onboardingStore ).updateProfileItems( profileItems )`

This is used to update `poocommerce_onboarding_profile`.

- `dispatch( onboardingStore ).updateStoreCurrencyAndMeasurementUnits( countryCode )`

This is used to update the store's currency and measurement units, which can be found under PooCommerce → Settings → General → Currency Options and PooCommerce → Settings → Products → Measurements.

- `dispatch( settingOptionsStore ).saveSetting( 'general', 'poocommerce_default_country', countryCode )`

This is used to update the store's country.

- `dispatch( settingOptionsStore ).saveSetting( 'advanced', 'poocommerce_allow_tracking', optInDataSharing )`

This is used to update the user's preference for usage tracking.

### Extensions Installation

The Core Profiler has a loading screen that is shown after the Extensions page. This loading screen is meant to hide the installation of Extensions, while also giving the user a sense of progress. At the same time, some extensions take extremely long to install, and thus we have a 30 second timeout. 

The selected extensions will be put into an installation queue, and the queue will be processed sequentially while the loader is on screen.

Beyond the 30 second timeout, the remaining plugins will be installed in the background, and the user will be redirected to the PooCommerce Admin homescreen or the Jetpack connection page.

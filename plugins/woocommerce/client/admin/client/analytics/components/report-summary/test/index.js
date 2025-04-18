/**
 * External dependencies
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ReportSummary } from '../';

const expectTooltipToBeVisible = () =>
	expect( screen.getByRole( 'tooltip' ) ).toBeVisible();

const expectTooltipToBeHidden = () =>
	expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument();

const waitExpectTooltipToShow = async ( timeout = 3000 ) =>
	await waitFor( expectTooltipToBeVisible, { timeout } );

const waitExpectTooltipToHide = async ( timeout = 3000 ) =>
	await waitFor( expectTooltipToBeHidden, { timeout } );

const hoverOutside = async () => {
	await userEvent.hover( document.body );
	await userEvent.hover( document.body, { clientX: 10, clientY: 10 } );
};

describe( 'ReportSummary', () => {
	function renderChart(
		type,
		primaryValue,
		secondaryValue,
		isError = false,
		isRequesting = false,
		props
	) {
		const selectedChart = {
			key: 'total_sales',
			label: 'Total sales',
			type,
		};
		const charts = [ selectedChart ];
		const endpoint = 'revenue';
		const query = {};
		const summaryData = {
			totals: {
				primary: {
					total_sales: primaryValue,
				},
				secondary: {
					total_sales: secondaryValue,
				},
			},
			isError,
			isRequesting,
		};
		return render(
			<ReportSummary
				charts={ charts }
				endpoint={ endpoint }
				query={ query }
				selectedChart={ selectedChart }
				summaryData={ summaryData }
				{ ...props }
			/>
		);
	}

	test( 'should set the correct prop values for the SummaryNumber components', async () => {
		renderChart( 'number', 1000.5, 500.25 );

		expect( screen.getByText( '1,000.5' ) ).toBeInTheDocument();
		const delta = screen.getByText( '100%' );
		expect( delta ).toBeInTheDocument();
		expectTooltipToBeHidden();

		userEvent.hover( delta );
		await waitExpectTooltipToShow();

		const tooltip = await screen.findByText( 'Previous year: 500.25' );
		expect( tooltip ).toBeInTheDocument();

		await hoverOutside();
		await waitExpectTooltipToHide();

		expect( screen.queryByText( 'Previous year: 500.25' ) ).toBeNull();
	} );

	test( 'should format currency numbers properly', async () => {
		renderChart( 'currency', 1000.5, 500.25 );

		expect( screen.getByText( '$1,000.50' ) ).toBeInTheDocument();

		const delta = screen.getByText( '100%' );
		expect( delta ).toBeInTheDocument();
		expectTooltipToBeHidden();

		userEvent.hover( delta );
		const tooltip = await screen.findByText( 'Previous year: $500.25' );

		expect( tooltip ).toBeInTheDocument();
		expect( tooltip ).toBeInTheDocument();

		await hoverOutside();
		await waitExpectTooltipToHide();

		expect( screen.queryByText( 'Previous year: $500.25' ) ).toBeNull();
	} );

	test( 'should format average numbers properly', async () => {
		renderChart( 'average', 1000.5, 500.25 );

		expect( screen.getByText( '1001' ) ).toBeInTheDocument();

		const delta = screen.getByText( '100%' );
		expect( delta ).toBeInTheDocument();
		expectTooltipToBeHidden();

		userEvent.hover( delta );
		const tooltip = await screen.findByText( 'Previous year: 500' );
		expect( tooltip ).toBeInTheDocument();

		await hoverOutside();
		await waitExpectTooltipToHide();

		expect( screen.queryByText( 'Previous year: 500' ) ).toBeNull();
	} );

	test( 'should not break if secondary value is 0', async () => {
		renderChart( 'number', 1000.5, 0 );

		expect( screen.getByText( '1,000.5' ) ).toBeInTheDocument();

		const delta = screen.getByText( '0%' );
		expect( delta ).toBeInTheDocument();
		expectTooltipToBeHidden();

		userEvent.hover( delta );
		const tooltip = await screen.findByText( 'Previous year: 0' );
		await waitExpectTooltipToShow();
		expect( tooltip ).toBeInTheDocument();

		await hoverOutside();
		await waitExpectTooltipToHide();

		expect( screen.queryByText( 'Previous year: 0' ) ).toBeNull();
	} );

	test( 'should show 0s when displaying an empty search', async () => {
		renderChart( 'number', null, undefined );

		expect( screen.getAllByText( 'N/A' ) ).not.toBeNull();

		const delta = screen.getByLabelText( 'No change from Previous year:' );
		expect( delta ).toBeInTheDocument();
	} );

	test( 'should display AnalyticsError when isError is true', () => {
		renderChart( 'number', null, null, true );

		expect(
			screen.getByText(
				'There was an error getting your stats. Please try again.'
			)
		).toBeInTheDocument();
	} );

	test( 'should display SummaryListPlaceholder when summaryData.isRequesting is true', () => {
		const { container } = renderChart( 'number', null, null, false, true );

		expect(
			container.querySelector( '.poocommerce-summary.is-placeholder' )
		).toBeInTheDocument();
	} );
} );

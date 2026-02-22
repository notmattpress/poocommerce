/**
 * External dependencies
 */
import { usePaginationProps } from '@poocommerce/components';

export type PaginationProps = usePaginationProps & {
	className?: string;
	perPageOptions?: number[];
	defaultPerPage?: number;
};

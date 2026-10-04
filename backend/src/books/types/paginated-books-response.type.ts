/**
 * Represents one paginated response from the book catalog API.
*/

import { CatalogBook } from './catalog-book.type';

export interface PaginatedBooksResponse {
  items: CatalogBook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
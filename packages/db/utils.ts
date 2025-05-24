import {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  and,
  or,
  not,
  like,
  ilike,
  between,
  inArray,
  notInArray,
  desc,
  asc,
  sql,
  count,
  type AnyColumn,
  type SQLWrapper,
} from "drizzle-orm";

import { createId } from "@paralleldrive/cuid2";

export {
  eq, // Equal
  ne, // Not equal
  gt, // Greater than
  gte, // Greater than or equal
  lt, // Less than
  lte, // Less than or equal
  isNull, // Check if value is NULL
  isNotNull, // Check if value is NOT NULL
  and, // Combine conditions with AND
  or, // Combine conditions with OR
  not, // Negate a condition
  like, // Pattern matching (case-sensitive)
  ilike, // Pattern matching (case-insensitive)
  between, // Check if value is between two values
  inArray, // Check if value is in an array
  notInArray, // Check if value is not in an array
  desc, // Sort in descending order
  asc, // Sort in ascending order
  sql, // Raw SQL expression
  count, // Count the number of rows
};

/**
 * Helper utilities for working with Drizzle ORM
 */

// Common where clause helper
export function whereClause(...conditions: SQLWrapper[]) {
  return { where: and(...conditions) };
}

// Common orderBy helper
export function orderByClause(
  column: AnyColumn | SQLWrapper,
  direction = "asc" as const,
) {
  return { orderBy: direction === "asc" ? asc(column) : desc(column) };
}

// Pagination helper
export function paginationClause(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return {
    limit: pageSize,
    offset,
  };
}

// ID generation helper using cuid2
export function generateId() {
  return createId();
}

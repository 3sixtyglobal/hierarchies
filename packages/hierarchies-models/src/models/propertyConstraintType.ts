// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Defines the types of constraints that can be applied to federation properties.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PropertyConstraintType = {
	/**
	 * Value must contain a specific substring.
	 */
	Contains: "Contains",

	/**
	 * Value must start with a specific substring.
	 */
	StartsWith: "StartsWith",

	/**
	 * Value must end with a specific substring.
	 */
	EndsWith: "EndsWith",

	/**
	 * Value must be greater than a specific value.
	 */
	GreaterThan: "GreaterThan",

	/**
	 * Value must be less than a specific value.
	 */
	LessThan: "LessThan"
} as const;

/**
 * Type representing the possible condition types.
 */
export type PropertyConstraintType =
	(typeof PropertyConstraintType)[keyof typeof PropertyConstraintType];

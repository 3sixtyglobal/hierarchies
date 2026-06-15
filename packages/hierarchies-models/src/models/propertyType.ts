// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Defines the supported data types for property values.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PropertyType = {
	/**
	 * Value is a string.
	 */
	String: "String",

	/**
	 * Value is a bigint.
	 */
	BigInt: "BigInt"
} as const;

/**
 * Type representing the possible property types.
 */
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

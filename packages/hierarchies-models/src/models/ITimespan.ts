// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Represents a timespan in a federation hierarchy.
 */
export interface ITimespan {
	/**
	 * Valid from as bigint string so it can be serialized accurately.
	 */
	validFrom?: string;

	/**
	 * Valid to as bigint string so it can be serialized accurately.
	 */
	validTo?: string;
}

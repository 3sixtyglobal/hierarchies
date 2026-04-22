// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Represents a root authority in a federation hierarchy.
 */
export interface IRootAuthority {
	/**
	 * The ID of the root authority.
	 */
	id: string;

	/**
	 * The account ID of the root authority.
	 */
	accountId: string;
}

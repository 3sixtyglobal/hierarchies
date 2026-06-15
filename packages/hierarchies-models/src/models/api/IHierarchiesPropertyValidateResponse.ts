// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Response for property validation.
 */
export interface IHierarchiesPropertyValidateResponse {
	/**
	 * The response body.
	 */
	body: {
		/**
		 * Whether the provided property is valid.
		 */
		valid: boolean;
	};
}

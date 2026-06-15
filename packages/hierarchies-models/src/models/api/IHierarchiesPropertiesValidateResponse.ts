// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Response for properties validation.
 */
export interface IHierarchiesPropertiesValidateResponse {
	/**
	 * The response body.
	 */
	body: {
		/**
		 * Whether all provided properties are valid.
		 */
		valid: boolean;
	};
}

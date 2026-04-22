// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to get a property from a federation.
 */
export interface IHierarchiesPropertyGetRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation.
		 */
		federationId: string;

		/**
		 * The property name to get.
		 */
		propertyName: string;
	};
}

// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to get federation properties.
 */
export interface IHierarchiesPropertiesGetRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation to get.
		 */
		federationId: string;
	};

	/**
	 * The request query parameters.
	 */
	queryParams?: {
		/**
		 * Whether to include revoked properties in the retrieved federation, defaults to false.
		 */
		includeRevokedProperties?: string;
	};
}

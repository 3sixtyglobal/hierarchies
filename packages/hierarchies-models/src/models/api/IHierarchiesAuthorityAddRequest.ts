// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to add an authority to a federation.
 */
export interface IHierarchiesAuthorityAddRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation.
		 */
		federationId: string;
	};
	/**
	 * The request data.
	 */
	body: {
		/**
		 * The account id of the authority to add.
		 */
		accountId: string;
	};
}

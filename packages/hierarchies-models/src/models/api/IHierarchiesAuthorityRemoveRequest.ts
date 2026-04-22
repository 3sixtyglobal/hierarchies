// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to remove an authority from a federation.
 */
export interface IHierarchiesAuthorityRemoveRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation.
		 */
		federationId: string;
		/**
		 * The account id of the authority to remove.
		 */
		accountId: string;
	};
}

// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to get federation accreditations.
 */
export interface IHierarchiesAccreditationsGetRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation to get.
		 */
		federationId: string;

		/**
		 * The id of the authority for which to get the accreditations.
		 */
		accreditedById: string;
	};
}

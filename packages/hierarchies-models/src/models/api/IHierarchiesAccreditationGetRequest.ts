// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to get federation accreditation.
 */
export interface IHierarchiesAccreditationGetRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation to get.
		 */
		federationId: string;

		/**
		 * The id of the authority for which to get the accreditation.
		 */
		accreditedById: string;

		/**
		 * The id of the permission for which to get the accreditation.
		 */
		permissionId: string;
	};
}

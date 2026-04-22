// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to remove an accreditation from a federation.
 */
export interface IHierarchiesAccreditationRemoveRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the federation.
		 */
		federationId: string;
		/**
		 * The accredited by id.
		 */
		accreditedById: string;
		/**
		 * The permission id of the accreditation to remove.
		 */
		permissionId: string;
	};
}

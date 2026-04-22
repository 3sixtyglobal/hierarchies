// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAccreditation } from "../IAccreditation.js";

/**
 * Request to add an accreditation to a federation.
 */
export interface IHierarchiesAccreditationAddRequest {
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
	body: Omit<IAccreditation, "permissionId">;
}

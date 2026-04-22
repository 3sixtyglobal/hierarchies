// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IProperty } from "../IProperty.js";

/**
 * Request to add a property to a federation.
 */
export interface IHierarchiesPropertyAddRequest {
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
	body: IProperty;
}

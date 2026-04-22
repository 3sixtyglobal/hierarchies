// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to create a federation.
 */
export interface IHierarchiesFederationCreateRequest {
	/**
	 * The request data.
	 */
	body: {
		/**
		 * The root authorities to be included in the federation.
		 */
		rootAuthorities?: string[];

		/**
		 * The namespace of the connector to use for the federation, defaults to component configured namespace.
		 */
		namespace?: string;
	};
}

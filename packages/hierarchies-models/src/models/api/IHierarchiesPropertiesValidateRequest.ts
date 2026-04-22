// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IPropertyValue } from "../IPropertyValue.js";

/**
 * Request to validate properties for a federation.
 */
export interface IHierarchiesPropertiesValidateRequest {
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
		 * The accredited by id.
		 */
		accreditedById: string;

		/**
		 * The properties to validate.
		 */
		propertiesToValidate: { [propertyName: string]: IPropertyValue };
	};
}

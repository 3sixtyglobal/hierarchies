// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IPropertyValue } from "../IPropertyValue.js";

/**
 * Request to validate a property for a federation.
 */
export interface IHierarchiesPropertyValidateRequest {
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
		 * The property name to validate.
		 */
		propertyName: string;

		/**
		 * The property value to validate.
		 */
		propertyValue: IPropertyValue;
	};
}

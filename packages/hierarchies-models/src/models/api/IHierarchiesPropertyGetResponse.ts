// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IProperty } from "../IProperty.js";

/**
 * Response for getting a property.
 */
export interface IHierarchiesPropertyGetResponse {
	/**
	 * The response body.
	 */
	body: IProperty;
}

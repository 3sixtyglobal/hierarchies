// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IProperty } from "../IProperty.js";

/**
 * Response for getting properties.
 */
export interface IHierarchiesPropertiesGetResponse {
	/**
	 * The response body.
	 */
	body: IProperty[];
}

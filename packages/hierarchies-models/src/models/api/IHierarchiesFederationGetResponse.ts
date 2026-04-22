// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IFederation } from "../IFederation.js";

/**
 * Response for getting a federation.
 */
export interface IHierarchiesFederationGetResponse {
	/**
	 * The response body.
	 */
	body: IFederation;
}

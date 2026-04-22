// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAccreditation } from "../IAccreditation.js";

/**
 * Response for getting accreditations.
 */
export interface IHierarchiesAccreditationsGetResponse {
	/**
	 * The response body.
	 */
	body: IAccreditation[];
}

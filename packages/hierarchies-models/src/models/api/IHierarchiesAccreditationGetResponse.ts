// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAccreditation } from "../IAccreditation.js";

/**
 * Response for getting an accreditation.
 */
export interface IHierarchiesAccreditationGetResponse {
	/**
	 * The response body.
	 */
	body: IAccreditation;
}

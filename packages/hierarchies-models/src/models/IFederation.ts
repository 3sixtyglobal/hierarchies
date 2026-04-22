// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IGovernance } from "../index.js";
import type { IRootAuthority } from "./IRootAuthority.js";

/**
 * Represents a federation, which is a group of entities forming a trust hierarchy.
 * Federations define the root authorities and the schema for properties they manage.
 */
export interface IFederation {
	/**
	 * Unique identifier for the federation.
	 */
	id: string;

	/**
	 * List of root authority IDs associated with this federation.
	 */
	rootAuthorities: IRootAuthority[];

	/**
	 * The revoked root authorities in the federation. This is used to track which root authorities have been revoked and should no longer be trusted.
	 */
	revokedRootAuthorities: string[];

	/**
	 * The governance entity associated with this federation, if any. This is used to manage accreditations and attestations within the federation.
	 */
	governance: IGovernance;
}

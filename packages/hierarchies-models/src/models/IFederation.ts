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
	 * Account IDs of root authorities that have been revoked and are no longer trusted.
	 */
	revokedRootAuthorities: string[];

	/**
	 * The governance entity that manages accreditations and attestations within the federation.
	 */
	governance: IGovernance;
}

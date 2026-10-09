// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@3sixty/entity";
import { nameof } from "@3sixty/nameof";
import { Federation } from "./entities/federation.js";
/**
 * Registers the entity schema for the hierarchies entity storage connector.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<Federation>(), () =>
		EntitySchemaHelper.getSchema(Federation)
	);
}

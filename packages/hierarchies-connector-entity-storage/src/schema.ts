// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import { Federation } from "./entities/federation.js";
/**
 * Initialize the schema for the hierarchies entity storage connector.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<Federation>(), () =>
		EntitySchemaHelper.getSchema(Federation)
	);
}

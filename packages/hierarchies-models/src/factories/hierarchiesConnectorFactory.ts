// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@twin.org/core";
import type { IHierarchiesConnector } from "../models/IHierarchiesConnector.js";

/**
 * Factory for creating hierarchies connectors.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HierarchiesConnectorFactory =
	Factory.createFactory<IHierarchiesConnector>("hierarchies-connector");

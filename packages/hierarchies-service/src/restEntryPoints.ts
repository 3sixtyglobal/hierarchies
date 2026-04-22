// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@twin.org/api-models";
import { generateRestRoutesHierarchies, tagsHierarchies } from "./hierarchiesRoutes.js";

export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "hierarchies",
		defaultBaseRoute: "hierarchies",
		tags: tagsHierarchies,
		generateRoutes: generateRestRoutesHierarchies
	}
];

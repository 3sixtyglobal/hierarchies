# Function: hierarchiesFederationCreate()

> **hierarchiesFederationCreate**(`httpRequestContext`, `componentName`, `request`): `Promise`\<`ICreatedResponse`\>

Handles a request to create a federation.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

`IHierarchiesFederationCreateRequest`

The request to create a federation, containing the body with root authorities and optional namespace.

## Returns

`Promise`\<`ICreatedResponse`\>

The response object with HTTP status and Location header for the created federation.

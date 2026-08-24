# Function: hierarchiesAuthorityRemove()

> **hierarchiesAuthorityRemove**(`httpRequestContext`, `componentName`, `request`): `Promise`\<`INoContentResponse`\>

Handles a request to remove an authority from a federation.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

`IHierarchiesAuthorityRemoveRequest`

The request object.

## Returns

`Promise`\<`INoContentResponse`\>

The response object with HTTP no content status.

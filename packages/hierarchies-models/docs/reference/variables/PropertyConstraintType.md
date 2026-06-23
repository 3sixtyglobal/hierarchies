# Variable: PropertyConstraintType

> `const` **PropertyConstraintType**: `object`

Defines the types of constraints that can be applied to federation properties.

## Type Declaration

### Contains {#contains}

> `readonly` **Contains**: `"Contains"` = `"Contains"`

Value must contain a specific substring.

### StartsWith {#startswith}

> `readonly` **StartsWith**: `"StartsWith"` = `"StartsWith"`

Value must start with a specific substring.

### EndsWith {#endswith}

> `readonly` **EndsWith**: `"EndsWith"` = `"EndsWith"`

Value must end with a specific substring.

### GreaterThan {#greaterthan}

> `readonly` **GreaterThan**: `"GreaterThan"` = `"GreaterThan"`

Value must be greater than a specific value.

### LessThan {#lessthan}

> `readonly` **LessThan**: `"LessThan"` = `"LessThan"`

Value must be less than a specific value.

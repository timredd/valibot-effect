# valibot-effect

A TypeScript library that bridges [Valibot](https://valibot.dev) schema validation with [Effect](https://effect.website), providing a functional programming approach to data validation and error handling.

## Overview

`valibot-effect` wraps Valibot's parsing functions in Effect contexts, allowing you to compose validation logic with other Effect operations seamlessly. This integration brings the power of Effect's error handling, composition, and functional programming paradigms to Valibot's fast and lightweight schema validation.

## Features

- 🚀 **Effect Integration**: All parsing functions return `Effect` types for seamless composition
- ⚡ **Zero Overhead**: Thin wrapper around Valibot with minimal performance impact  
- 🔄 **Async Support**: Full support for async schemas and transformations
- 🎯 **Type Safety**: Full TypeScript support with proper type inference
- 🛠️ **Flexible Error Handling**: Choose between wrapped errors or raw validation issues

## Installation

### npm
```bash
npm install valibot-effect valibot effect
```

### yarn
```bash
yarn add valibot-effect valibot effect
```

### pnpm
```bash
pnpm add valibot-effect valibot effect
```

### bun
```bash
bun add valibot-effect valibot effect
```

### JSR
```bash
npx jsr add @timredd/valibot-effect
```

## Quick Start

```ts
import * as v from "valibot"
import { parse, safeParse } from "valibot-effect"
import { Effect } from "effect"

// Define a schema
const UserSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(0))
})

// Parse with Effect error handling
const parseUser = (input: unknown) =>
  parse(UserSchema, input)

// Use in Effect pipelines
const program = Effect.gen(function* () {
  const user = yield* parseUser({ 
    name: "John", 
    email: "john@example.com", 
    age: 30 
  })
  
  console.log("Valid user:", user)
  return user
})

Effect.runSync(program)
```

## API Reference

### `parse(schema, input, config?)`

Parses input using a Valibot schema and returns an Effect that fails with a `ValiError` on validation failure.

```ts
import { parse, ValiError } from "valibot-effect"

const schema = v.string()
const effect = parse(schema, "hello")
// Effect<string, ValiError<typeof schema>, never>
```

### `parseAsync(schema, input, config?)`

Asynchronously parses input, supporting schemas with async transformations and validations.

```ts
import { parseAsync } from "valibot-effect"

const schema = v.pipeAsync(
  v.string(),
  v.checkAsync(async (input) => await isValidEmail(input))
)

const effect = parseAsync(schema, "user@example.com")
// Effect<string, ValiError<typeof schema>, never>
```

### `safeParse(schema, input, config?)`

Parses input and returns raw validation issues as the error type, providing direct access to Valibot's validation details.

```ts
import { safeParse } from "valibot-effect"

const schema = v.object({ name: v.string() })
const effect = safeParse(schema, { name: 123 })
// Effect<{ name: string }, [BaseIssue<unknown>, ...BaseIssue<unknown>[]], never>

// Handle validation issues directly
Effect.catchAll(effect, (issues) => {
  console.log("Validation failed:", issues)
  return Effect.succeed({ name: "default" })
})
```

### `safeParseAsync(schema, input, config?)`

Asynchronously parses input and returns raw validation issues, combining async support with direct issue access.

```ts
import { safeParseAsync } from "valibot-effect"

const schema = v.pipeAsync(
  v.string(),
  v.checkAsync(async (input) => await isUniqueUsername(input))
)

const effect = safeParseAsync(schema, "newuser")
// Effect<string, [BaseIssue<unknown>, ...BaseIssue<unknown>[]], never>
```

## Error Handling

### ValiError vs Raw Issues

The library provides two error handling approaches:

- **`parse`/`parseAsync`**: Wrap validation errors in `ValiError` for consistent error handling
- **`safeParse`/`safeParseAsync`**: Return raw Valibot issues for detailed error inspection

```ts
// Using ValiError (wrapped)
const withWrappedError = parse(schema, input).pipe(
  Effect.catchTag("ValiError", (error) => {
    console.log("Valibot error:", error.cause)
    return Effect.succeed(defaultValue)
  })
)

// Using raw issues (direct access)
const withRawIssues = safeParse(schema, input).pipe(
  Effect.catchAll((issues) => {
    issues.forEach(issue => {
      console.log(`${issue.path}: ${issue.message}`)
    })
    return Effect.succeed(defaultValue)
  })
)
```

## Advanced Usage

### Composing with Other Effects

```ts
import { Effect, pipe } from "effect"
import { parse } from "valibot-effect"

const processUserData = (rawData: unknown) =>
  pipe(
    parse(UserSchema, rawData),
    Effect.flatMap(user => saveToDatabase(user)),
    Effect.flatMap(savedUser => sendWelcomeEmail(savedUser)),
    Effect.catchAll(error => 
      Effect.succeed({ error: "Failed to process user data" })
    )
  )
```

### Custom Error Handling

```ts
const parseWithCustomError = <T>(schema: v.BaseSchema<unknown, T>, input: unknown) =>
  safeParse(schema, input).pipe(
    Effect.mapError(issues => 
      new Error(`Validation failed: ${issues.map(i => i.message).join(", ")}`)
    )
  )
```

## Requirements

- **Node.js**: 16.x or higher
- **TypeScript**: 5.0 or higher
- **Dependencies**: `valibot` ^0.42.0, `effect` ^3.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

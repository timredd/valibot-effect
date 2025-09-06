import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as v from "valibot";

/**
 * @category errors
 * @since 1.0.0
 */
export class ValiError<
  TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
> extends Data.TaggedError("ValiError")<{ cause: v.ValiError<TSchema> }> {}

/**
 * Parses an input value using the provided Valibot schema and returns an Effect.
 *
 * This function wraps Valibot's `parse` function in an Effect context. If validation
 * fails, the effect will fail with a `ValiError` containing the original Valibot error.
 *
 * @param schema - The Valibot schema to validate against
 * @param input - The input value to parse and validate
 * @param config - Optional configuration for parsing behavior
 *
 * @returns An Effect that succeeds with the parsed output or fails with a ValiError
 *
 * @example
 * ```ts
 * import * as v from "valibot"
 * import { parse } from "valibot-effect"
 *
 * const schema = v.string()
 * const effect = parse(schema, "hello")
 * // Effect<string, ValiError<typeof schema>, never>
 * ```
 *
 * @category decoding
 * @since 1.0.0
 */
export function parse<
  const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  config?: v.Config<v.InferIssue<TSchema>>,
): Effect.Effect<v.InferOutput<TSchema>, ValiError<TSchema>, never> {
  return Effect.try({
    try: () => v.parse(schema, input, config),
    catch: (cause) =>
      new ValiError({ cause: v.isValiError(cause) ? cause : (cause as any) }),
  });
}

/**
 * Asynchronously parses an input value using the provided Valibot schema and returns an Effect.
 *
 * This function wraps Valibot's `parseAsync` function in an Effect context. If validation
 * fails, the effect will fail with a `ValiError` containing the original Valibot error.
 * Use this function when your schema contains async transformations or validations.
 *
 * @param schema - The Valibot schema (sync or async) to validate against
 * @param input - The input value to parse and validate
 * @param config - Optional configuration for parsing behavior
 *
 * @returns An Effect that succeeds with the parsed output or fails with a ValiError
 *
 * @example
 * ```ts
 * import * as v from "valibot"
 * import { parseAsync } from "valibot-effect"
 *
 * const schema = v.pipeAsync(v.string(), v.checkAsync(async (input) => {
 *   return await isValidEmail(input)
 * }))
 * const effect = parseAsync(schema, "user@example.com")
 * // Effect<string, ValiError<typeof schema>, never>
 * ```
 *
 * @category decoding
 * @since 1.0.0
 */
export function parseAsync<
  const TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  config?: v.Config<v.InferIssue<TSchema>>,
): Effect.Effect<v.InferOutput<TSchema>, ValiError<TSchema>, never> {
  return Effect.tryPromise({
    try: () => v.parseAsync(schema, input, config),
    catch: (cause) =>
      new ValiError({ cause: v.isValiError(cause) ? cause : (cause as any) }),
  });
}

/**
 * Safely parses an input value using the provided Valibot schema and returns an Effect.
 *
 * This function wraps Valibot's `safeParse` function in an Effect context. Unlike `parse`,
 * this function returns the raw validation issues as the error type instead of wrapping
 * them in a `ValiError`. This provides more direct access to the validation issues for
 * error handling and reporting.
 *
 * @param schema - The Valibot schema to validate against
 * @param input - The input value to parse and validate
 * @param config - Optional configuration for parsing behavior
 *
 * @returns An Effect that succeeds with the parsed output or fails with validation issues
 *
 * @example
 * ```ts
 * import * as v from "valibot"
 * import { safeParse } from "valibot-effect"
 *
 * const schema = v.object({ name: v.string() })
 * const effect = safeParse(schema, { name: 123 })
 * // Effect<{ name: string }, [BaseIssue<unknown>, ...BaseIssue<unknown>[]], never>
 *
 * // Handle validation issues directly
 * Effect.catchAll(effect, (issues) => {
 *   console.log("Validation failed:", issues)
 *   return Effect.succeed({ name: "default" })
 * })
 * ```
 *
 * @category decoding
 * @since 1.0.0
 */
export function safeParse<
  const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  config?: v.Config<v.InferIssue<TSchema>>,
): Effect.Effect<
  v.InferOutput<TSchema>,
  [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]],
  never
> {
  return Effect.suspend(() => {
    const result = v.safeParse(schema, input, config);
    return result.success
      ? Effect.succeed(result.output)
      : Effect.fail(result.issues);
  });
}

/**
 * Asynchronously and safely parses an input value using the provided Valibot schema and returns an Effect.
 *
 * This function wraps Valibot's `safeParseAsync` function in an Effect context. Unlike `parseAsync`,
 * this function returns the raw validation issues as the error type instead of wrapping
 * them in a `ValiError`. Use this function when your schema contains async transformations
 * or validations and you need direct access to validation issues.
 *
 * @param schema - The Valibot schema (sync or async) to validate against
 * @param input - The input value to parse and validate
 * @param config - Optional configuration for parsing behavior
 *
 * @returns An Effect that succeeds with the parsed output or fails with validation issues
 *
 * @example
 * ```ts
 * import * as v from "valibot"
 * import { safeParseAsync } from "valibot-effect"
 *
 * const schema = v.pipeAsync(
 *   v.string(),
 *   v.checkAsync(async (input) => await isUniqueUsername(input))
 * )
 *
 * const effect = safeParseAsync(schema, "newuser")
 * // Effect<string, [BaseIssue<unknown>, ...BaseIssue<unknown>[]], never>
 *
 * // Handle validation issues directly
 * Effect.catchAll(effect, (issues) => {
 *   const errors = issues.map(issue => issue.message)
 *   return Effect.fail(new Error(`Validation failed: ${errors.join(", ")}`))
 * })
 * ```
 *
 * @category decoding
 * @since 1.0.0
 */
export function safeParseAsync<
  const TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  config?: v.Config<v.InferIssue<TSchema>>,
): Effect.Effect<
  v.InferOutput<TSchema>,
  [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]],
  never
> {
  return Effect.flatMap(
    Effect.promise(() => v.safeParseAsync(schema, input, config)),
    (result) =>
      result.success
        ? Effect.succeed(result.output)
        : Effect.fail(result.issues),
  );
}

declare module "valibot" {
  interface ValiError<
    TSchema extends
      | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
      | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
  > {
    _tag: "ValiError";
    cause: v.ValiError<TSchema>;
  }
}

import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as v from "valibot";

/**
 * @category errors
 * @since 1.0.0
 */
class ValiError<
  TSchema extends
    | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    | v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>,
> extends Data.TaggedError("ValiError")<{ cause: v.ValiError<TSchema> }> {}

/**
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
    try: () => v.safeParseAsync(schema, input, config),
    catch: (cause) =>
      new ValiError({ cause: v.isValiError(cause) ? cause : (cause as any) }),
  });
}

/**
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

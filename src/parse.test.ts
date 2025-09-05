import { describe, it } from "@effect/vitest";
import { assertLeft, assertRight } from "@effect/vitest/utils";
import { Effect, pipe } from "effect";
import * as v from "valibot";
import {
  parse,
  parseAsync,
  safeParse,
  safeParseAsync,
  ValiError,
} from "./parse.ts";

describe("Parsing", () => {
  const schema = v.pipe(
    v.pipe(
      v.pipe(v.string(), v.nonEmpty()),
      v.decimal(),
      v.transform(Number),
      v.pipe(v.number(), v.minValue(0)),
    ),
    v.maxValue(100),
  );

  it.effect("parse - success", () =>
    Effect.gen(function* () {
      const result = yield* pipe(parse(schema, "100"), Effect.either);
      assertRight(result, 100);
    }),
  );

  it.effect("parse - failure", () =>
    Effect.gen(function* () {
      const result = yield* pipe(parse(schema, 100), Effect.either);
      assertLeft(
        result,
        new ValiError({
          cause: new v.ValiError([
            {
              abortEarly: undefined,
              abortPipeEarly: undefined,
              expected: "string",
              input: 100,
              issues: undefined,
              kind: "schema",
              lang: undefined,
              message: "Invalid type: Expected string but received 100",
              path: undefined,
              received: "100",
              requirement: undefined,
              type: "string",
            },
          ]),
        }),
      );
    }),
  );

  it.effect("safeParse - success", () =>
    Effect.gen(function* () {
      const result = yield* pipe(safeParse(schema, "100"), Effect.either);
      assertRight(result, 100);
    }),
  );

  it.effect("safeParse - failure", () =>
    Effect.gen(function* () {
      const result = yield* pipe(safeParse(schema, 100), Effect.either);
      assertLeft(result, [
        {
          abortEarly: undefined,
          abortPipeEarly: undefined,
          expected: "string",
          input: 100,
          issues: undefined,
          kind: "schema",
          lang: undefined,
          message: "Invalid type: Expected string but received 100",
          path: undefined,
          received: "100",
          requirement: undefined,
          type: "string",
        },
      ]);
    }),
  );

  const schemaAsync = v.pipeAsync(
    v.pipeAsync(
      v.pipe(v.string(), v.nonEmpty()),
      v.decimal(),
      v.transformAsync(async (input) => Number(input)),
      v.pipe(v.number(), v.minValue(0)),
    ),
    v.maxValue(100),
  );

  it.effect("parseAsync - success", () =>
    Effect.gen(function* () {
      const result = yield* pipe(parseAsync(schemaAsync, "100"), Effect.either);
      assertRight(result, 100);
    }),
  );

  it.effect("parseAsync - failure", () =>
    Effect.gen(function* () {
      const result = yield* pipe(parseAsync(schema, 100), Effect.either);
      assertLeft(
        result,
        new ValiError({
          cause: new v.ValiError([
            {
              abortEarly: undefined,
              abortPipeEarly: undefined,
              expected: "string",
              input: 100,
              issues: undefined,
              kind: "schema",
              lang: undefined,
              message: "Invalid type: Expected string but received 100",
              path: undefined,
              received: "100",
              requirement: undefined,
              type: "string",
            },
          ]),
        }),
      );
    }),
  );

  it.effect("safeParseAsync - success", () =>
    Effect.gen(function* () {
      const result = yield* pipe(
        safeParseAsync(schemaAsync, "100"),
        Effect.either,
      );
      assertRight(result, 100);
    }),
  );

  it.effect("safeParseAsync - failure", () =>
    Effect.gen(function* () {
      const result = yield* pipe(safeParse(schema, 100), Effect.either);
      assertLeft(result, [
        {
          abortEarly: undefined,
          abortPipeEarly: undefined,
          expected: "string",
          input: 100,
          issues: undefined,
          kind: "schema",
          lang: undefined,
          message: "Invalid type: Expected string but received 100",
          path: undefined,
          received: "100",
          requirement: undefined,
          type: "string",
        },
      ]);
    }),
  );
});

/**
 * @params T - The URL e.g. /posts/:id
 * @params TAcc - Accumulator object
 */
type RecursivelyExtractPathParams<
  T extends string,
  TAcc extends null | Record<string, string>
> = T extends `/:${infer PathParam}/${infer Right}`
  ? { [key in PathParam]: string } & RecursivelyExtractPathParams<Right, TAcc>
  : T extends `/:${infer PathParam}`
  ? { [key in PathParam]: string }
  : T extends `/${string}/${infer Right}`
  ? RecursivelyExtractPathParams<Right, TAcc>
  : T extends `/${string}`
  ? TAcc
  : T extends `:${infer PathParam}/${infer Right}`
  ? { [key in PathParam]: string } & RecursivelyExtractPathParams<Right, TAcc>
  : T extends `:${infer PathParam}`
  ? TAcc & { [key in PathParam]: string }
  : T extends `${string}/${infer Right}`
  ? RecursivelyExtractPathParams<Right, TAcc>
  : TAcc;

/**
 * Extract path params from path function
 *
 * { id: string, commentId: string }
 *
 * @params T - The URL e.g. /posts/:id
 */
export type ParamsFromUrl<T extends string> = RecursivelyExtractPathParams<
  T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}
> extends infer U
  ? keyof U extends never
    ? undefined
    : {
        [key in keyof U]: U[key];
      }
  : never;

/**
 * @param path - The URL e.g. /posts/:id
 * @param params - The params e.g. { id: string }
 * @returns - The URL with the params e.g. /posts/123
 */
export const insertParamsIntoPath = <T extends string>(
  path: T,
  params: ParamsFromUrl<T>
) => {
  return path
    .replace(/:([^/]+)/g, (_, p) => {
      return params?.[p] || '';
    })
    .replace(/\/\//g, '/');
};

/**
 *
 * @param query - The query e.g. { id: string }
 * @returns - The query url segment e.g. ?id=123
 */
export const convertQueryParamsToUrlString = (
  query: Record<string, string>
) => {
  const queryString =
    typeof query === 'object'
      ? Object.keys(query)
          .map((key) => {
            if (query[key] === undefined) {
              return null;
            }
            return (
              encodeURIComponent(key) + '=' + encodeURIComponent(query[key])
            );
          })
          .filter(Boolean)
          .join('&')
      : '';

  return queryString.length > 0 &&
    queryString !== null &&
    queryString !== undefined
    ? '?' + queryString
    : '';
};

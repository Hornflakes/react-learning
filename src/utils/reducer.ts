type ActionType = 'create' | 'delete';
export type Action<T extends ActionType, P = undefined> = P extends undefined
    ? { readonly type: T }
    : { readonly type: T; readonly payload: P };

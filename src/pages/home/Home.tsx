import { getCurrencies } from '@apis';
import { Dialog, SuspenseAsync, TitledSection, type DialogHandle } from '@components';
import { accountsReducer, useAccounts, useAccountsDispatch, useToastsDispatch } from '@contexts';
import { useAsyncDispatch, useOptimisticReducer, useSuspenseResource } from '@hooks';
import { createMockTransaction, type Account, type Currency } from '@types';
import { type FormActionState } from '@utils';
import {
    Activity,
    startTransition,
    useActionState,
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from 'react';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const { promise, refetch, version } = useSuspenseResource({
        cacheKey: 'currencies',
        fetcher: getCurrencies,
    });

    return (
        <SuspenseAsync
            key={version}
            promise={promise}
            refetch={refetch}
            pending={<p>Loading currencies...</p>}
            ready={(data) => (
                <TitledSection title="Currencies">
                    <ul>
                        {data.map((currency) => (
                            <li
                                key={currency.code}
                                style={{
                                    marginBlock: '.75rem',
                                }}
                            >
                                {currency.name} ({currency.code})
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => refetch()}>refetch currencies</button>
                </TitledSection>
            )}
            errored={({ error, refetch, reset }) => (
                <>
                    <p>{error.message}</p>
                    <button
                        onClick={() => {
                            startTransition(() => {
                                refetch();
                                reset();
                            });
                        }}
                    >
                        retry currencies
                    </button>
                </>
            )}
        ></SuspenseAsync>
    );
};

type AccountFormProps = {
    ref: RefObject<HTMLFormElement | null>;
    availableCurrencies: Currency[];
    onSuccess: () => void;
    onCancel: () => void;
};
const AccountForm = ({ ref, availableCurrencies, onSuccess, onCancel }: AccountFormProps) => {
    console.log('[AccountForm] rendered');

    const dispatch = useAccountsDispatch();
    const { asyncDispatch, cancelAsyncDispatch } = useAsyncDispatch({
        dispatch,
    });

    const [state, formAction, isPending] = useActionState<FormActionState, FormData>(
        async (_, formData) => {
            const currencyCode = formData.get('currencyCode') as string;
            if (!currencyCode) {
                return {
                    message: 'Please select a currency',
                    status: 'errored',
                    timestamp: Temporal.Now.instant().epochMilliseconds,
                };
            }

            try {
                await asyncDispatch({
                    type: 'create',
                    payload: {
                        balance: 0,
                        currencyCode,
                    },
                });
                onSuccess();
                return {
                    message: 'Account created succesfully!',
                    status: 'ready',
                    timestamp: Temporal.Now.instant().epochMilliseconds,
                };
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return {
                        message: '',
                        status: 'unresolved',
                        timestamp: Temporal.Now.instant().epochMilliseconds,
                    };
                }

                console.error(err);
                const message = err instanceof Error ? err.message : 'Unknown error occured.';
                return {
                    message,
                    status: 'errored',
                    timestamp: Temporal.Now.instant().epochMilliseconds,
                };
            }
        },
        { message: '', status: 'unresolved', timestamp: 0 },
    );

    const toastsDispatch = useToastsDispatch();

    const onStatusChange = useEffectEvent((state: FormActionState) => {
        if (!['ready', 'errored'].includes(state.status)) return;

        toastsDispatch({
            type: 'create',
            payload: {
                type: state.status === 'ready' ? 'success' : 'error',
                message: state.message,
            },
        });
    });

    useEffect(() => {
        onStatusChange(state);
    }, [state]);

    return (
        <form ref={ref} action={formAction}>
            <label style={{ display: 'block', marginBottom: '.25rem' }}>pick a currency:</label>
            <select
                name="currencyCode"
                defaultValue=""
                required
                style={{
                    width: '100%',
                }}
            >
                <option value="" disabled>
                    select currency...
                </option>
                {availableCurrencies.map((c) => (
                    <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                    </option>
                ))}
            </select>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    marginTop: '1.75rem',
                }}
            >
                <button
                    type="button"
                    onClick={() => {
                        if (!isPending) {
                            onCancel();
                            return;
                        }
                        cancelAsyncDispatch();
                    }}
                >
                    cancel
                </button>
                <button type="submit" disabled={isPending}>
                    {isPending ? 'creating account...' : 'create account'}
                </button>
            </div>
        </form>
    );
};

type CreateAccountDialogProps = {
    accounts: Account[];
};
const CreateAccountDialog = ({ accounts }: CreateAccountDialogProps) => {
    console.log('[CreateAccountDialog] rendered');

    const dialogRef = useRef<DialogHandle>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const { promise, refetch, version } = useSuspenseResource({
        cacheKey: 'currencies',
        fetcher: getCurrencies,
    });

    return (
        <SuspenseAsync
            key={version}
            promise={promise}
            refetch={refetch}
            pending={<button title="Loading currencies...">create account</button>}
            ready={(currencies) => {
                const availableCurrencies = currencies.filter(
                    (c) => !accounts.some((a) => a.currencyCode === c.code),
                );

                return (
                    <>
                        <button onClick={() => dialogRef.current?.showModal()}>
                            create account
                        </button>
                        <Dialog ref={dialogRef} onClose={() => formRef.current?.reset()}>
                            <AccountForm
                                ref={formRef}
                                availableCurrencies={availableCurrencies}
                                onSuccess={() => dialogRef.current?.close()}
                                onCancel={() => dialogRef.current?.close()}
                            />
                        </Dialog>
                    </>
                );
            }}
            errored={({ error: _, refetch, reset }) => (
                <button
                    title="retry currencies"
                    onClick={() => {
                        startTransition(() => {
                            refetch();
                            reset();
                        });
                    }}
                >
                    create account
                </button>
            )}
        ></SuspenseAsync>
    );
};

const AccountsList = () => {
    console.log('[AccountsList] rendered');

    const accounts = useAccounts();
    const dispatch = useAccountsDispatch();
    const { asyncDispatch } = useAsyncDispatch({ dispatch });
    const { optimisticState: optimisticAccounts, dispatchOptimistic } = useOptimisticReducer(
        accounts,
        accountsReducer,
    );
    const toastsDispatch = useToastsDispatch();

    const attemptDelete = (id: number) => {
        dispatchOptimistic({ type: 'delete', payload: id }, async () => {
            try {
                await asyncDispatch({ type: 'delete', payload: id });
                toastsDispatch({
                    type: 'create',
                    payload: {
                        type: 'success',
                        message: 'Account deleted succesfully!',
                    },
                });
            } catch (err) {
                if (!(err instanceof Error)) return;

                console.error(err);
                toastsDispatch({
                    type: 'create',
                    payload: {
                        type: 'error',
                        message: err.message,
                    },
                });
            }
        });
    };

    return (
        <TitledSection title="Accounts">
            <ul>
                {optimisticAccounts.map((account) => (
                    <li
                        key={account.id}
                        style={{
                            marginBlock: '.75rem',
                        }}
                    >
                        {account.currencyCode}{' '}
                        <button onClick={() => attemptDelete(account.id)}>delete</button>
                    </li>
                ))}
            </ul>
            <CreateAccountDialog accounts={accounts} />
        </TitledSection>
    );
};

const Transactions = () => {
    console.log('[Transactions] rendered');

    const transactions = useMemo(() => {
        console.log("[Transactions] transactions[] memo'ed");

        return Array.from({ length: 500 }, (_, i) => createMockTransaction(i));
    }, []);

    const listRef = useRef<HTMLUListElement>(null);
    const positions = useRef<Map<string, number>>(new Map());
    const [shuffled, setShuffled] = useState(transactions);

    useLayoutEffect(() => {
        if (!listRef.current || positions.current.size === 0) return;

        const items = listRef.current.querySelectorAll('li');
        items.forEach((item) => {
            const id = item.dataset.id!;
            const firstTop = positions.current.get(id);
            const lastTop = item.getBoundingClientRect().top;

            if (firstTop !== undefined && firstTop !== lastTop) {
                const deltaY = firstTop - lastTop;

                item.animate(
                    [{ transform: `translateY(${deltaY}px)` }, { transform: 'translateY(0)' }],
                    {
                        duration: 400,
                        easing: 'cubic-bezier(0.2, 0, 0, 1)',
                    },
                );
            }
        });

        positions.current.clear();
    }, [shuffled]);

    const shuffle = () => {
        if (!listRef.current) return;

        const items = listRef.current.querySelectorAll('li');
        items.forEach((item) => {
            const id = item.dataset.id!;
            positions.current.set(id, item.getBoundingClientRect().top);
        });

        setShuffled((prev) => [...prev].sort(() => Math.random() - 0.5));
    };

    const unshuffle = () => {
        if (!listRef.current) return;

        const items = listRef.current.querySelectorAll('li');
        items.forEach((item) => {
            const id = item.dataset.id!;
            positions.current.set(id, item.getBoundingClientRect().top);
        });

        setShuffled(transactions);
    };

    return (
        <>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={shuffle}>shuffle</button>
                <button onClick={unshuffle}>unshuffle</button>
            </div>

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '.75rem',
                    minHeight: 0,
                    overflowY: 'auto',
                    border: '3px solid',
                    marginBottom: '.75rem',
                }}
            >
                <ul ref={listRef}>
                    {shuffled.map((s) => (
                        <li key={s.id} data-id={s.id}>
                            {s.description}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

const TransactionsList = () => {
    console.log('[TransactionsList] rendered');

    const [show, setShow] = useState(false);

    return (
        <TitledSection
            title="Transactions"
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '.75rem',
                minHeight: 0,
            }}
        >
            <button
                onClick={() => setShow(!show)}
                style={{
                    alignSelf: 'start',
                }}
            >
                {show ? 'hide' : 'show'}
            </button>

            <Activity mode={show ? 'visible' : 'hidden'}>
                <Transactions />
            </Activity>
        </TitledSection>
    );
};

export const HomePage = () => {
    console.log('[HomePage] rendered');

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            <CurrenciesList />
            <AccountsList />

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                }}
            >
                <TransactionsList />
            </div>
        </div>
    );
};

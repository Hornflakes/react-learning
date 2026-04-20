import { getCurrencies } from '@apis';
import { Dialog, type DialogHandle, SuspenseAsync, TitledSection } from '@components';
import { useAccounts, useAccountsDispatch, useToastsDispatch } from '@contexts';
import { useAsyncDispatch, useSuspenseResource } from '@hooks';
import type { Account, Currency } from '@types';
import type { FormActionState } from '@utils';
import { startTransition, useActionState, useEffect, useEffectEvent, useRef } from 'react';

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
    ref: React.RefObject<HTMLFormElement | null>;
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
                    timestamp: Date.now(),
                };
            }

            try {
                await asyncDispatch({
                    type: 'create',
                    payload: { balance: 0, currencyCode },
                });
                onSuccess();
                return {
                    message: 'Account created succesfully!',
                    status: 'ready',
                    timestamp: Date.now(),
                };
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return { message: '', status: 'unresolved', timestamp: Date.now() };
                }
                console.error(err);
                const message = err instanceof Error ? err.message : 'Unknown error occured.';
                return { message, status: 'errored', timestamp: Date.now() };
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

    return (
        <TitledSection title="Accounts">
            <ul>
                {accounts.map((account) => (
                    <li
                        key={account.id}
                        style={{
                            marginBlock: '.75rem',
                        }}
                    >
                        {account.currencyCode} <button>delete</button>
                    </li>
                ))}
            </ul>
            <CreateAccountDialog accounts={accounts} />
        </TitledSection>
    );
};

export const HomePage = () => {
    console.log('[HomePage] rendered');

    return (
        <>
            <CurrenciesList />
            <AccountsList />
        </>
    );
};

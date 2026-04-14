import { getCurrencies } from '@apis';
import { Dialog, type DialogHandle, SuspenseAsync, TitledSection } from '@components';
import { useAccounts } from '@contexts';
import { useSuspenseResource } from '@hooks';
import type { Account } from '@types';
import { startTransition, useRef } from 'react';

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

type CreateAccountDialogProps = {
    accounts: Account[];
};
const CreateAccountDialog = ({ accounts }: CreateAccountDialogProps) => {
    const dialogRef = useRef<DialogHandle>(null);

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
                        <Dialog ref={dialogRef}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <label
                                    htmlFor="currency"
                                    style={{
                                        display: 'block',
                                        marginBottom: '.25rem',
                                    }}
                                >
                                    pick a currency:
                                </label>
                                <select name="currency" defaultValue="" required>
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
                                        marginTop: '1.75rem',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => dialogRef.current?.close()}
                                    >
                                        cancel
                                    </button>
                                    <button type="submit">submit</button>
                                </div>
                            </form>
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

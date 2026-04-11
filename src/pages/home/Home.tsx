import { getAccounts, getCurrencies } from '@apis';
import { ErrorBoundary, TitledSection } from '@components';
import { usePromiseResource, useResource } from '@hooks';
import type { Account } from '@types';
import { Suspense, use } from 'react';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const [{ data, state, error }, { refetch }] = useResource(getCurrencies);

    return (
        <TitledSection title="Currencies">
            {state === 'pending' ? (
                <p>Loading currencies...</p>
            ) : error ? (
                <>
                    <p>{error.message}</p>
                    <button onClick={() => refetch()}>retry currencies</button>
                </>
            ) : (
                <>
                    <ul>
                        {data?.map((currency) => (
                            <li key={currency.code}>
                                {currency.name} ({currency.code})
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => refetch()}>refetch currencies</button>
                </>
            )}
        </TitledSection>
    );
};

type AccountsListProps = {
    promise: Promise<Account[]>;
    refetch: () => void;
};
const AccountsList = ({ promise, refetch }: AccountsListProps) => {
    console.log('[AccountsList] rendered');

    const accounts = use(promise);

    return (
        <TitledSection title="Accounts">
            <ul>
                {accounts.map((account) => (
                    <li key={account.id}>{account.currencyCode}</li>
                ))}
            </ul>
            <button
                onClick={() => {
                    refetch();
                }}
            >
                refetch accounts
            </button>
        </TitledSection>
    );
};

export const HomePage = () => {
    const [accountsPromise, refetchAccounts, _isPending] = usePromiseResource(getAccounts);

    return (
        <>
            <CurrenciesList />
            <ErrorBoundary
                fallback={(err, reset) => {
                    return (
                        <>
                            <p>{err.message}</p>
                            <button
                                onClick={() => {
                                    refetchAccounts();
                                    reset();
                                }}
                            >
                                retry accounts
                            </button>
                        </>
                    );
                }}
            >
                <Suspense fallback={<p>Loading accounts...</p>}>
                    <AccountsList promise={accountsPromise} refetch={refetchAccounts} />
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

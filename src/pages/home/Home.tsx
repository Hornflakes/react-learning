import { getAccounts, getCurrencies } from '@apis';
import { ErrorBoundary, TitledSection } from '@components';
import { usePromiseResource, useResource, type PromiseResource } from '@hooks';
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
                    <button onClick={() => refetch()}>refetch</button>
                </>
            ) : (
                <ul>
                    {data?.map((currency) => (
                        <li key={currency.code}>
                            {currency.name} ({currency.code})
                        </li>
                    ))}
                </ul>
            )}
        </TitledSection>
    );
};

type AccountsListProps = {
    res: PromiseResource<Account[]>;
};
const AccountsList = ({ res }: AccountsListProps) => {
    console.log('[AccountsList] rendered');

    const accounts = use(res.request.promise);

    return (
        <TitledSection title="Accounts">
            <ul>
                {accounts.map((account) => (
                    <li key={account.id}>{account.currencyCode}</li>
                ))}
            </ul>
        </TitledSection>
    );
};

export const HomePage = () => {
    const [res, { refetch }] = usePromiseResource(getAccounts);

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
                                    refetch();
                                    reset();
                                }}
                            >
                                refetch
                            </button>
                        </>
                    );
                }}
            >
                <Suspense fallback={<p>Loading accounts...</p>}>
                    <AccountsList res={res} />
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

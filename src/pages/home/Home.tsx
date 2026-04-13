import { getCurrencies } from '@apis';
import { SuspenseAsync, TitledSection } from '@components';
import { useAccounts } from '@contexts';
import { useSuspenseResource } from '@hooks';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const { promise, refetch } = useSuspenseResource({
        cacheKey: 'currencies',
        fetcher: getCurrencies,
    });

    return (
        <SuspenseAsync
            promise={promise}
            refetch={refetch}
            pending={<p>Loading currencies...</p>}
            ready={(data) => (
                <TitledSection title="Currencies">
                    <ul>
                        {data.map((currency) => (
                            <li key={currency.code}>
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
                            refetch();
                            reset();
                        }}
                    >
                        retry currencies
                    </button>
                </>
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
                    <li key={account.id}>{account.currencyCode}</li>
                ))}
            </ul>
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

import { getAccounts, getCurrencies } from '@apis';
import { EffectAsync, SuspenseAsync, TitledSection } from '@components';
import { useEffectResource, useSuspenseResource } from '@hooks';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const [resource, { refetch }] = useEffectResource({
        fetcher: getCurrencies,
    });

    return (
        <EffectAsync
            resource={resource}
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
            errored={(error) => (
                <>
                    <p>{error.message}</p>
                    <button onClick={() => refetch()}>retry currencies</button>
                </>
            )}
        ></EffectAsync>
    );
};

const AccountsList = () => {
    console.log('[AccountsList] rendered');

    const { promise, refetch } = useSuspenseResource({
        cacheKey: 'accounts',
        fetcher: getAccounts,
    });

    return (
        <SuspenseAsync
            promise={promise}
            refetch={refetch}
            pending={<p>Loading accounts...</p>}
            ready={(data) => (
                <TitledSection title="Accounts">
                    <ul>
                        {data.map((account) => (
                            <li key={account.id}>{account.currencyCode}</li>
                        ))}
                    </ul>
                    <button onClick={() => refetch()}>refetch accounts</button>
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
                        retry accounts
                    </button>
                </>
            )}
        ></SuspenseAsync>
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

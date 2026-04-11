import { getAccounts, getCurrencies } from '@apis';
import { TitledSection } from '@components';
import { useResource } from '@hooks';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const { data, state, error } = useResource(getCurrencies);

    return (
        <TitledSection title="Currencies">
            {state === 'pending' ? (
                <p>Loading currencies...</p>
            ) : error ? (
                <p>{error.message}</p>
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

const AccountsList = () => {
    console.log('[AccountsList] rendered');

    const { data, state, error } = useResource(getAccounts);

    return (
        <TitledSection title="Accounts">
            {state === 'pending' ? (
                <p>Loading accounts...</p>
            ) : error ? (
                <p>{error.message}</p>
            ) : (
                <ul>
                    {data?.map((account) => (
                        <li key={account.id}>{account.currencyCode}</li>
                    ))}
                </ul>
            )}
        </TitledSection>
    );
};

export const HomePage = () => {
    return (
        <>
            <CurrenciesList />
            <AccountsList />
        </>
    );
};

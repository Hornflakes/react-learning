import { getCurrencies } from '@apis';
import { Dialog, type DialogHandle, SuspenseAsync, TitledSection } from '@components';
import { useAccounts } from '@contexts';
import { useSuspenseResource } from '@hooks';
import { useRef } from 'react';

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

const CreateAccountDialog = () => {
    const dialogRef = useRef<DialogHandle>(null);

    return (
        <>
            <button onClick={() => dialogRef.current?.showModal()}>create account</button>
            <Dialog ref={dialogRef}>
                <p>Hello, world!</p>
                <button onClick={() => dialogRef.current?.close()}>cancel</button>
            </Dialog>
        </>
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
            <CreateAccountDialog />
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

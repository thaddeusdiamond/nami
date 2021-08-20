import React from 'react';
import {
  getCurrency,
  getNetwork,
  setCurrency,
  setNetwork,
} from '../api/extension';
import { NETWORK_ID, NODE } from '../config/config';
import {
  createStore,
  action,
  useStoreActions,
  StoreProvider,
  useStoreState,
} from 'easy-peasy';
import { Box, Text } from '@chakra-ui/layout';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Spinner } from '@chakra-ui/react';

const settings = {
  settings: null,
  setSettings: action((state, settings) => {
    setCurrency(settings.currency);
    setNetwork(settings.network);
    state.settings = {
      ...settings,
      adaSymbol: settings.network.id === NETWORK_ID.mainnet ? '₳' : 't₳',
    };
  }),
};

const initSettings = async (setSettings) => {
  const currency = await getCurrency();
  const network = await getNetwork();
  setSettings({
    currency: currency || 'usd',
    network: network || { id: NETWORK_ID.mainnet, node: NODE.mainnet },
    adaSymbol: network ? (network.id === NETWORK_ID.mainnet ? '₳' : 't₳') : '₳',
  });
};

// create the global store object
const store = createStore({
  settings,
});

// sets the initial store state
const initStore = async (state, actions) => {
  await initSettings(actions.settings.setSettings);
};

// Store component that loads the store and calls initStore
const StoreInit = ({ children }) => {
  const actions = useStoreActions((actions) => actions);
  const state = useStoreState((state) => state);
  const settings = state.settings.settings;
  const [loading, setLoading] = React.useState(true);

  const init = async () => {
    await initStore(state, actions);
    setLoading(false);
  };

  React.useEffect(() => {
    init();
  }, []);
  return (
    <>
      {loading ? (
        <Box
          height="100vh"
          width="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner color="teal" speed="0.5s" />
        </Box>
      ) : (
        <>
          {children}
          {/* Settings Overlay */}
          {settings.network.id === NETWORK_ID.testnet && (
            <Box
              position="absolute"
              left="3"
              bottom="3"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="semibold"
              color="orange.400"
            >
              <InfoOutlineIcon />
              <Box width="1" />
              <Text>Testnet</Text>
            </Box>
          )}
        </>
      )}
    </>
  );
};

// wrapping the StoreInit component inside the actual StoreProvider in order to initialize the store state
export default ({ children }) => {
  return (
    <StoreProvider store={store}>
      <StoreInit>{children}</StoreInit>
    </StoreProvider>
  );
};

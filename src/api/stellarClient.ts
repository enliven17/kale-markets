import { Horizon } from "@stellar/stellar-sdk";
import { STELLAR_HORIZON_URL, getStellarServer, type StellarNetworkName } from "@/config/stellar";

export type HorizonClient = {
  server: Horizon.Server;
  network: StellarNetworkName;
};

export const createHorizonClient = (network: StellarNetworkName): HorizonClient => {
  return {
    server: getStellarServer(network) as unknown as Horizon.Server,
    network,
  };
};

export const loadAccount = async (client: HorizonClient, accountId: string) => {
  return client.server.loadAccount(accountId);
};



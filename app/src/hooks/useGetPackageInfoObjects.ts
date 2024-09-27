import { useSuiClientsContext } from "@/components/providers/client-provider";
import { useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "./useActiveAddress";
import { SuiClient, SuiObjectResponse } from "@mysten/sui/client";
import { AppQueryKeys, Network } from "@/utils/types";
import { fetchAllOwnedObjects } from "@/utils/query";
import { Constants } from "@/lib/constants";

const packageInfoType = (network: Network) =>
  `${Constants.packageInfoIds[network]}::package_info::PackageInfo`;

export const DefaultPackageDisplay = {
  gradientFrom: "E0E1EC",
  gradientTo: "BDBFEC",
  name: "",
  textColor: "030F1C",
};

export const DefaultColors = [
  {
    name: "Blue",
    gradientFrom: "E0E1EC",
    gradientTo: "BDBFEC",
    textColor: "030F1C",
  },
  {
    name: "Pink",
    gradientFrom: "FCE4EC",
  },
];
export type PackageDisplayType = {
  gradientFrom: string;
  gradientTo: string;
  name: string;
  textColor: string;
};

export type PackageInfo = {
  objectId: string;
  packageAddress: string;
  upgradeCapId: string;
  display: PackageDisplayType;
  gitVersionsTableId: string;
  metadata: any;
};

const getPackageInfoObjects = async (
  client: SuiClient,
  address: string,
  network: Network,
) => {
  return fetchAllOwnedObjects({
    client,
    address,
    filter: {
      StructType: packageInfoType(network),
    },
    options: {
      showContent: true,
      showDisplay: true,
    },
  });
};

const parsePackageInfoContent = (cap?: SuiObjectResponse): PackageInfo => {
  if (!cap) throw new Error("Invalid upgrade cap object");
  if (!cap.data) throw new Error("Invalid upgrade cap object");
  if (!cap.data.content) throw new Error("Invalid upgrade cap object");
  if (cap.data.content.dataType !== "moveObject")
    throw new Error("Invalid upgrade cap object");

  const fields = cap.data.content.fields as Record<string, any>;

  return {
    objectId: fields.id.id,
    packageAddress: fields.package_address,
    upgradeCapId: fields.upgrade_cap_id,
    display: {
      gradientFrom: fields.display.fields.gradient_from,
      gradientTo: fields.display.fields.gradient_to,
      name: fields.display.fields.name,
      textColor: fields.display.fields.text_color,
    },
    gitVersionsTableId: fields.git_versioning.fields.id.id,
    metadata: fields.metadata,
  };
};

export function useGetPackageInfoObjects(network: Network) {
  const address = useActiveAddress();
  const clients = useSuiClientsContext();

  return useQuery({
    queryKey: [AppQueryKeys.OWNED_PACKAGE_INFOS, address, network],
    queryFn: async () => {
      return await getPackageInfoObjects(
        clients[network],
        address!,
        network as Network,
      );
    },
    enabled: !!address && !!network,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select(data) {
      return data.map(parsePackageInfoContent);
    },
  });
}
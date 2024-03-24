"use client";

import NavBar from "@/components/navbar";
import Reserve from "@/components/reserve";
import { getKlendReserves } from "@/requests/backend";
import { getBestLendAccount } from "@/requests/bestlend";
import { LSTS, STABLES } from "@/utils/consts";
import { Asset, LendingMarket } from "@/utils/models";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Progress,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

const groups: [string, Asset[]][] = [
  ["Stables", STABLES],
  ["SOL and LSTs", LSTS],
];

export default function Home() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const reservesQuery = useQuery("getKlendReserves", () => getKlendReserves());
  const reserves = reservesQuery.data ?? [];

  const bestlendAccount = useQuery(
    "bestlendAccount",
    () => getBestLendAccount(connection, publicKey),
    { enabled: !!publicKey }
  );

  const isInitialized = bestlendAccount.data?.collateralGroup !== undefined;
  const isLoading = bestlendAccount.isLoading || reservesQuery.isLoading;

  return (
    <Box>
      <NavBar />
      <Stack p="1rem" spacing="1rem">
        {/* <InitAccount /> */}
        {groups.map(([group, assets]) => (
          <Card key={group}>
            <CardBody>
              <CardHeader>
                <Heading size="md">{group}</Heading>
              </CardHeader>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th></Th>
                      <Th isNumeric>available</Th>
                      <Th isNumeric>supply</Th>
                      <Th isNumeric>borrow</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {assets.map((s) => (
                      <Reserve
                        key={s.mint.toBase58()}
                        asset={s}
                        lendingMarket={LendingMarket.KAMINO}
                        reserve={reserves?.find(
                          (r) => r.mint === s.mint.toBase58()
                        )}
                      />
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
            {isLoading && (
              <Progress
                size="xs"
                isIndeterminate
                colorScheme="orange"
                bg="owalaBeige"
                mx="4px"
              />
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

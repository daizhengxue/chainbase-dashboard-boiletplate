import { TaskValue } from "@/components/QueryTaskProvider/context";

export const getQueryString = () => `
WITH
    prices AS (
        SELECT
            toStartOfMinute(timestamp) AS time,
            price
        FROM
            prices.token_prices
        WHERE
            contract_address = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
            AND timestamp >= '2022-09-01'
    ),
    start_price AS (
        SELECT
            price
        FROM
            prices
        ORDER BY
            time
        LIMIT
            1
    ),
    end_price AS (
        SELECT
            price
        FROM
            prices
        ORDER BY
            time DESC
        LIMIT
            1
    ),
    transfers AS (
        SELECT
            toStartOfMinute(block_timestamp) AS time,
            contract_address,
            from_address,
            to_address,
            (CAST(value AS Float64) / 1000000000000000000) AS amount
        FROM
            ethereum.token_transfers
        WHERE
            contract_address = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
            AND block_timestamp > '2022-09-01'
    ),
    buys AS (
        SELECT
            to_address AS address,
            SUM(amount) AS total_amount,
            SUM(amount * prices.price) AS cost,
            cost / total_amount AS buy_avg_price
        FROM
            transfers
        LEFT JOIN prices ON transfers.time = prices.time
        GROUP BY
            to_address
    ),
    sells AS (
        SELECT
            from_address AS address,
            SUM(amount) AS total_amount,
            SUM(amount * prices.price) AS cost,
            cost / total_amount AS sell_avg_price
        FROM
            transfers
        LEFT JOIN prices ON transfers.time = prices.time
        GROUP BY
            from_address
    )
SELECT
    buys.address,
    buys.total_amount AS buy_amount,
    COALESCE(
        buys.buy_avg_price,
        (SELECT price FROM start_price)
    ) AS buy_price,
    sells.total_amount AS sell_amount,
    COALESCE(
        sells.sell_avg_price,
        (SELECT price FROM end_price)
    ) AS sell_price,
    sell_price - buy_price AS profit
FROM
    buys OUTER JOIN sells ON buys.address = sells.address
WHERE
    buy_amount > 100
    OR sell_amount > 100
ORDER BY
    profit DESC
`;

export const tokenProfitQuery: TaskValue = {
  id: 'token-profit-query',
  task: async () => {
    const res = await fetch('/api/chainbase/dw/query', {
      method: 'POST',
      body: JSON.stringify({
        query: getQueryString(),
      }),
      headers: {
        "Content-Type": 'application/json'
      }
    });
    const result = await res.json();
    return result?.data?.result
  },
  data: [],
  status: 'idle'
}

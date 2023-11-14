import { TaskValue } from "@/components/QueryTaskProvider/context";

// Function to create SQL query with lowercased address
export const getQueryString = (address: string) => {
  const lowerCaseAddress = address.toLowerCase();
  return `
    With
        prices as (
            SELECT
                toStartOfMinute(timestamp) as time,
                price
            FROM
                prices.token_prices
            WHERE
                contract_address = '${lowerCaseAddress}'
                AND timestamp >= '2022-09-01'
        ),
        start_price as (
            select
                price
            from
                prices
            order by
                time
            limit
                1
        ), end_price as (
            select
                price
            from
                prices
            order by
                time desc
            limit
                1
        ), transfers as (
            SELECT
                toStartOfMinute(block_timestamp) AS time,
                contract_address,
                from_address,
                to_address,
                (CAST(value AS Float64) / 1000000000000000000) AS amount
            FROM
                ethereum.token_transfers
            WHERE
                ethereum.token_transfers.contract_address = '${lowerCaseAddress}'
                AND ethereum.token_transfers.block_timestamp > '2022-09-01'
        ),
        buys as (
            select
                to_address as address,
                sum(amount) as total_amount,
                sum(amount * prices.price) as cost,
                cost / total_amount as buy_avg_price
            from
                transfers
                left join prices on transfers.time = prices.time
            group by
                to_address
        ),
        sells as (
            select
                from_address as address,
                sum(amount) as total_amount,
                sum(amount * prices.price) as cost,
                cost / total_amount as sell_avg_price
            from
                transfers
                left join prices on transfers.time = prices.time
            group by
                from_address
        )
    select
        buys.address,
        buys.total_amount as buy_amount,
        COALESCE(
            buys.buy_avg_price,
            (
                select
                    price
                from
                    start_price
            )
        ) as buy_price,
        sells.total_amount as sell_amount,
        COALESCE(
            sells.sell_avg_price,
            (
                select
                    price
                from
                    end_price
            )
        ) as sell_price,
        sell_price - buy_price as profit
    from
        buys
        OUTER JOIN sells on buys.address = sells.address
    where
        buy_amount > 100
        or sell_amount > 100
    order by
        profit DESC
  `;
}

// The main task function that uses the query string
export const tokenProfitQuery: TaskValue = {
  id: 'token-profit-query',
  task: async (params: { address: string }) => {
    // Get the query string with the address converted to lowercase
    const query = getQueryString(params.address);
    const res = await fetch(`/api/chainbase/dw/query`, {
      method: 'POST',
      body: JSON.stringify({
        query: query,
      }),
      headers: {
        "Content-Type": 'application/json'
      }
    });
    const result = await res.json();
    return result.data?.result;
  },
  data: [],
  status: 'idle'
}

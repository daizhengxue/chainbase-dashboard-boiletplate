"use client"; 
import GridItemContentContainer from "@/components/GridLayout/GridItemContentContainer";
import { QueryTaskContext } from "@/components/QueryTaskProvider/context";
import ResultTable from "@/components/ResultTable";
import { useContext, useEffect } from "react";
import { tokenProfitQuery, getQueryString } from '../utils/tokenProfitQuery'

export default function TokenProfitTable() {

  const queryTaskVaule = useContext(QueryTaskContext)
  
  const task = queryTaskVaule?.tasks.find(t => t.id === tokenProfitQuery.id)

  useEffect(() => {
    if (!task) {
      queryTaskVaule?.addTask(tokenProfitQuery)
    }
    if (task?.status === 'idle') {
      queryTaskVaule?.callTask(tokenProfitQuery.id)
    }
  }, [queryTaskVaule, task])
  
  const columns = [
    { title:"Address", dataIndex: 'address' }, 
    { title: "Buy Amount", dataIndex: 'buy_amount' },
    { title: "Buy Price", dataIndex: 'buy_price' },
    { title: "Sell Amount", dataIndex: 'sell_amount' },
    { title: "Sell Price", dataIndex: 'sell_price' },
    { title: "Profit", dataIndex: 'profit' }
  ];
  
  return (
    <GridItemContentContainer 
      title="Token Profit Analysis" 
      outerUrl={`https://console.chainbase.com/dataCloud?sql=${encodeURIComponent(getQueryString())}`} 
      dragable>
      <ResultTable columns={columns} data={task?.data || []} />
    </GridItemContentContainer>
  );
}

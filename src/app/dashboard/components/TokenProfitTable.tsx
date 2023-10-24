"use client"; 
import GridItemContentContainer from "@/components/GridLayout/GridItemContentContainer";
import { QueryTaskContext } from "@/components/QueryTaskProvider/context";
import ResultTable from "@/components/ResultTable";
import { useContext, useEffect, useState, useCallback } from "react"; // 导入 useState 和 useCallback
import { tokenProfitQuery, getQueryString } from '../utils/tokenProfitQuery'
import AddressInput from "@/components/AddressInput";

export default function TokenProfitTable() {
  const [address, setAddress] = useState<string>("");  // 添加 address state

  const queryTaskVaule = useContext(QueryTaskContext)
  
  const task = queryTaskVaule?.tasks.find(t => t.id === tokenProfitQuery.id)

  useEffect(() => {
    if (!task) {
      queryTaskVaule?.addTask(tokenProfitQuery)
    }
    if (task?.status === 'idle' && address) {   // only query when address exist
      queryTaskVaule?.callTask(tokenProfitQuery.id, { address })
    }
  }, [queryTaskVaule, task, address])   
  
  const handleAddressQuery = useCallback((inputAddress: string) => {
    setAddress(inputAddress);  // update address
  }, []);

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
      outerUrl={`https://console.chainbase.com/dataCloud?sql=${encodeURIComponent(getQueryString(address))}`} 
      dragable>
      <AddressInput onQuery={handleAddressQuery} />  {/* add AddressInput component */}
      <ResultTable columns={columns} data={task?.data || []} />
    </GridItemContentContainer>
  );
}

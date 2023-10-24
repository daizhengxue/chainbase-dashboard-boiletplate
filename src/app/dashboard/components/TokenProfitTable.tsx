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
    if (task?.status === 'idle' && address) {   // 只有当地址存在时才执行查询
      queryTaskVaule?.callTask(tokenProfitQuery.id, { address })
    }
  }, [queryTaskVaule, task, address])   // 添加 address 为依赖
  
  const handleAddressQuery = useCallback((inputAddress: string) => {
    setAddress(inputAddress);  // 更新地址
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
      <AddressInput onQuery={handleAddressQuery} />  {/* 添加 AddressInput 组件 */}
      <ResultTable columns={columns} data={task?.data || []} />
    </GridItemContentContainer>
  );
}

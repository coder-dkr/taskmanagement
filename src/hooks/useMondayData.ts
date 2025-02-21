import { useContext } from "react";
import { MondayDataContext } from "@/contexts/MondayDataContext";



const useMondayData = () => {
  return useContext(MondayDataContext)
}

export default useMondayData

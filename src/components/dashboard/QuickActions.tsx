import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NewShipmentDialog } from "../shipments/NewShipmentDialog";

const QuickActions = () => {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <NewShipmentDialog type="import" onSuccess={refreshPage} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a new import process</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <NewShipmentDialog type="export" onSuccess={refreshPage} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a new export process</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => console.log("More actions clicked")}
                >
                  <PlusCircle className="w-4 h-4" />
                  More Actions
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View additional actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

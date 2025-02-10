import React from "react";
import { Card } from "../ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  DollarSign,
  FileCheck,
  Bell,
} from "lucide-react";

interface SummaryWidgetProps {
  widgets?: {
    activeShipments: number;
    totalImportValue: number;
    processingStatus: number;
    pendingAlerts: number;
  };
}

const SummaryWidgets = ({
  widgets = {
    activeShipments: 24,
    totalImportValue: 1250000,
    processingStatus: 85,
    pendingAlerts: 3,
  },
}: SummaryWidgetProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-background">
      {/* Active Shipments Widget */}
      <Card className="p-4 flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex items-center text-green-600">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm">12%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Active Shipments</p>
          <h3 className="text-2xl font-bold">{widgets.activeShipments}</h3>
        </div>
      </Card>

      {/* Total Import Value Widget */}
      <Card className="p-4 flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex items-center text-red-600">
            <ArrowDownRight className="h-4 w-4" />
            <span className="text-sm">3%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Import Value</p>
          <h3 className="text-2xl font-bold">
            ${(widgets.totalImportValue / 1000).toFixed(1)}k
          </h3>
        </div>
      </Card>

      {/* Processing Status Widget */}
      <Card className="p-4 flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileCheck className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex items-center text-green-600">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm">5%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Processing Status</p>
          <h3 className="text-2xl font-bold">{widgets.processingStatus}%</h3>
        </div>
      </Card>

      {/* Pending Alerts Widget */}
      <Card className="p-4 flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex items-center text-red-600">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm">2</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Pending Alerts</p>
          <h3 className="text-2xl font-bold">{widgets.pendingAlerts}</h3>
        </div>
      </Card>
    </div>
  );
};

export default SummaryWidgets;

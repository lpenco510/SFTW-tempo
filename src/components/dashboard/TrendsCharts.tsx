import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendsChartsProps {
  importData?: Array<{
    date: string;
    value: number;
  }>;
  exportData?: Array<{
    date: string;
    value: number;
  }>;
}

const defaultImportData = [
  { date: "2024-01", value: 4000 },
  { date: "2024-02", value: 3000 },
  { date: "2024-03", value: 5000 },
  { date: "2024-04", value: 2780 },
  { date: "2024-05", value: 1890 },
  { date: "2024-06", value: 2390 },
];

const defaultExportData = [
  { date: "2024-01", value: 3000 },
  { date: "2024-02", value: 2000 },
  { date: "2024-03", value: 4000 },
  { date: "2024-04", value: 2800 },
  { date: "2024-05", value: 1500 },
  { date: "2024-06", value: 2100 },
];

const TrendsCharts = ({
  importData = defaultImportData,
  exportData = defaultExportData,
}: TrendsChartsProps) => {
  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>Import/Export Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="combined">Combined View</TabsTrigger>
            <TabsTrigger value="imports">Imports</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="combined">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={importData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Imports"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    data={exportData}
                    dataKey="value"
                    name="Exports"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="imports">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={importData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Imports"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="exports">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Exports"
                    stroke="#16a34a"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrendsCharts;

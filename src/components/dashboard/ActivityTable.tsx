import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ArrowUpDown } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  reference: string;
  status: string;
  date: string;
  value: string;
}

interface ActivityTableProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    type: "Import",
    reference: "IMP-2024-001",
    status: "In Progress",
    date: "2024-03-20",
    value: "$15,000",
  },
  {
    id: "2",
    type: "Export",
    reference: "EXP-2024-001",
    status: "Completed",
    date: "2024-03-19",
    value: "$22,500",
  },
  {
    id: "3",
    type: "Import",
    reference: "IMP-2024-002",
    status: "Pending",
    date: "2024-03-18",
    value: "$8,750",
  },
];

const ActivityTable = ({
  activities = defaultActivities,
}: ActivityTableProps) => {
  return (
    <Card className="w-full p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Activities</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search activities..."
              className="pl-8 w-[250px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                Type
                <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead>
                Reference
                <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead>
                Status
                <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead>
                Date
                <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
              <TableHead className="text-right">
                Value
                <ArrowUpDown className="ml-2 h-4 w-4 inline-block" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.type}</TableCell>
                <TableCell>{activity.reference}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      activity.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : activity.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {activity.status}
                  </span>
                </TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell className="text-right">{activity.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ActivityTable;

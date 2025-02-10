import React from "react";
import { motion } from "framer-motion";
import Sidebar from "./dashboard/Sidebar";
import SummaryWidgets from "./dashboard/SummaryWidgets";
import TrendsCharts from "./dashboard/TrendsCharts";
import ActivityTable from "./dashboard/ActivityTable";
import QuickActions from "./dashboard/QuickActions";
import { TourGuide } from "./onboarding/TourGuide";

const Home = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div data-tour="sidebar" className="h-full">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            data-tour="summary-widgets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SummaryWidgets />
          </motion.div>

          <motion.div
            data-tour="quick-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <QuickActions />
          </motion.div>

          <motion.div
            data-tour="trends-charts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <TrendsCharts />
          </motion.div>

          <motion.div
            data-tour="activity-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <ActivityTable />
          </motion.div>
        </div>
      </main>

      <TourGuide />
    </div>
  );
};

export default Home;

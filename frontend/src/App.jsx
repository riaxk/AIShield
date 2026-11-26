import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import AppShell from "./components/AppShell";

import Overview from "./pages/Overview";
import AttackLab from "./pages/AttackLab";
import DefenseLab from "./pages/DefenseLab";
import KnowledgeBase from "./pages/KnowledgeBase";
import Benchmark from "./pages/Benchmark";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";

export default function App() {
  const location = useLocation();

  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="route-workspace"
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.16 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Overview />} />
            <Route path="/attack" element={<AttackLab />} />
            <Route path="/defense" element={<DefenseLab />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/logs" element={<AuditLogs />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
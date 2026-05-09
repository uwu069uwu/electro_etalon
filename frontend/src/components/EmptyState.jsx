import React from "react";
import { motion } from "framer-motion";
import { PackageX } from "lucide-react";

export const EmptyState = ({
  icon: Icon = PackageX,
  title,
  description,
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    data-testid="empty-state"
    className="flex flex-col items-center justify-center py-16 sm:py-24 text-center"
  >
    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
      <Icon size={24} className="text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold font-display">{title}</h3>
    {description && (
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

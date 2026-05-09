"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button
            className="rounded-xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )
      )}
    </motion.div>
  );
}

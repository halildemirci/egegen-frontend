import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminFormPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AdminFormPanel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: AdminFormPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn('pt-6', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function AdminFormFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}

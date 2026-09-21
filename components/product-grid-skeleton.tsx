import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function ProductGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-label="Loading products..."
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <Card
          key={index}
          className="flex flex-col h-full overflow-hidden border-border/70"
        >
          {/* Image skeleton */}
          <div className="aspect-square w-full bg-muted/50 p-6 flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-lg" />
          </div>

          <CardHeader className="p-4 pb-2 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>

          <CardContent className="p-4 pt-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>

          <CardFooter className="p-4 pt-2 border-t bg-muted/20 flex flex-col gap-3">
            <div className="flex justify-between w-full">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

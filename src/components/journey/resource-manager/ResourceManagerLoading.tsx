
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function ResourceManagerLoading() {
  return (
    <div className="flex justify-center items-center p-12">
      <LoadingIndicator size="lg" />
    </div>
  );
}

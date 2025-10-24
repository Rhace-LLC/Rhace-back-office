import GenericSheet from "@/components/generic_sheet_overlay";
import { CategoryData } from "@/store/category.slice";
import { LucideEye } from "lucide-react";
import { useState } from "react";
import ViewCategory from "./ViewCategory";

export default function RenderTableData({ data }: { data: CategoryData[] }) {
  const [selected, setSelected] = useState<CategoryData | null>(null);
  const [selectedOpen, setSelectedOpen] = useState<boolean>(false);

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border">
      <div className="p-0 [&:last-child]:pb-6">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                <th className="h-10 px-2 text-left font-medium">Image</th>
                <th className="h-10 px-2 text-left font-medium">
                  Category Name
                </th>
                <th className="h-10 px-2 text-left font-medium">Created At</th>
                <th className="h-10 px-2 text-left font-medium">Updated At</th>
                <th className="h-10 w-20 px-2 text-left font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <td className="px-3 py-2">
                    <img
                      className="h-12 w-12 rounded-md object-cover"
                      src={item.image_url || "/placeholder.png"}
                      alt={item.name}
                    />
                  </td>

                  <td className="p-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600">
                        {item.description}
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {item.id}
                      </span>
                    </div>
                  </td>

                  <td className="p-2 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="p-2 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="p-2">
                    <button
                      onClick={() => {
                        setSelected(item);
                        setSelectedOpen(true);
                      }}
                      className="text-muted-foreground hover:text-foreground transition"
                      title="View Category"
                    >
                      <LucideEye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-sm text-gray-500"
                  >
                    No Data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <GenericSheet
          open={selectedOpen}
          onOpenChange={(open) => setSelectedOpen(open)}
          title="View Category"
          subtitle="View, Edit and Update This Category"
        >
          <ViewCategory data={selected} />
        </GenericSheet>
      )}
    </div>
  );
}

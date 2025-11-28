import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Construction } from 'lucide-react';

const LINE_GREEN = '#06C755';

interface MainPageProps {
  inventoryComponent: React.ReactNode;
}

export function MainPage({ inventoryComponent }: MainPageProps) {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0 border-b-0">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:border-b-2 rounded-none px-6 py-4 data-[state=inactive]:text-gray-600"
              style={{
                borderColor: activeTab === 'inventory' ? LINE_GREEN : 'transparent',
                color: activeTab === 'inventory' ? LINE_GREEN : undefined,
              }}
            >
              Inventory Assets
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="data-[state=active]:border-b-2 rounded-none px-6 py-4 data-[state=inactive]:text-gray-600"
              style={{
                borderColor: activeTab === 'stock' ? LINE_GREEN : 'transparent',
                color: activeTab === 'stock' ? LINE_GREEN : undefined,
              }}
            >
              Stock Assets
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:border-b-2 rounded-none px-6 py-4 data-[state=inactive]:text-gray-600"
              style={{
                borderColor: activeTab === 'reports' ? LINE_GREEN : 'transparent',
                color: activeTab === 'reports' ? LINE_GREEN : undefined,
              }}
            >
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="m-0 p-0">
          {inventoryComponent}
        </TabsContent>

        <TabsContent value="stock" className="m-0 p-0">
          <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div
                  className="p-6 rounded-full"
                  style={{ backgroundColor: `${LINE_GREEN}20` }}
                >
                  <Construction
                    className="h-16 w-16"
                    style={{ color: LINE_GREEN }}
                  />
                </div>
              </div>
              <h2 className="text-2xl text-gray-900">Under Maintenance</h2>
              <p className="text-gray-600 max-w-md">
                This feature is currently under development. Please check back later.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="m-0 p-0">
          <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div
                  className="p-6 rounded-full"
                  style={{ backgroundColor: `${LINE_GREEN}20` }}
                >
                  <Construction
                    className="h-16 w-16"
                    style={{ color: LINE_GREEN }}
                  />
                </div>
              </div>
              <h2 className="text-2xl text-gray-900">Under Maintenance</h2>
              <p className="text-gray-600 max-w-md">
                This feature is currently under development. Please check back later.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

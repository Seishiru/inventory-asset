import { Package, Archive, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const LINE_GREEN = '#06C755';

interface LandingPageProps {
  onNavigate: (page: 'inventory' | 'stock' | 'reports') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const navigationCards = [
    {
      id: 'inventory' as const,
      title: 'Inventory Assets',
      description: 'Manage and track all your inventory assets',
      icon: Package,
      available: true,
    },
    {
      id: 'stock' as const,
      title: 'Stock Assets',
      description: 'Monitor stock levels and warehouse inventory',
      icon: Archive,
      available: false,
    },
    {
      id: 'reports' as const,
      title: 'Reports',
      description: 'Generate reports and analytics',
      icon: FileText,
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: LINE_GREEN }}
            >
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-900 dark:text-gray-100">
                Asset Management System
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Select a module to get started
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                className={`group relative overflow-hidden transition-all duration-300 ${
                  card.available
                    ? 'cursor-pointer hover:shadow-lg hover:scale-105 dark:hover:bg-gray-700'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => card.available && onNavigate(card.id)}
              >
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div
                      className="inline-flex p-4 rounded-lg"
                      style={{
                        backgroundColor: card.available
                          ? `${LINE_GREEN}20`
                          : '#e5e7eb',
                      }}
                    >
                      <Icon
                        className="h-10 w-10"
                        style={{
                          color: card.available ? LINE_GREEN : '#9ca3af',
                        }}
                      />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl text-gray-900 dark:text-gray-100">
                      {card.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {card.description}
                    </p>

                    {/* Status Badge */}
                    {!card.available && (
                      <div className="pt-2">
                        <span className="inline-block px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                          Under Maintenance
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Hover Effect Border */}
                {card.available && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ backgroundColor: LINE_GREEN }}
                  />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

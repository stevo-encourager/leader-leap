
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Category } from '@/utils/assessmentTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategoryHeaderProps {
  category: Category;
  activeCategory: number;
  totalCategories: number;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  activeCategory,
  totalCategories
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="mb-10 encourager-card">
      <CardContent className="p-6 bg-encourager-background-light">
        <div className="flex justify-between mb-8">
          <div className="text-sm text-muted-foreground">
            Competency {activeCategory + 1} of {totalCategories}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalCategories }).map((_, index) => (
              <div 
                key={index}
                className={`h-1 rounded-full ${
                  isMobile ? 'w-3' : 'w-6'
                }`}
                style={
                  index <= activeCategory 
                    ? { backgroundColor: '#C96736' }  // Brand Accent for completed and current
                    : { backgroundColor: '#e2e8f0' }  // Gray for upcoming
                }
              />
            ))}
          </div>
        </div>

        <CardTitle className="text-2xl font-normal encourager-header mb-4 uppercase">{category.title}</CardTitle>
        <CardDescription className="text-encourager-gray mt-2">
          {category.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default CategoryHeader;

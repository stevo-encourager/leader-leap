
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
      <CardContent className="p-6 bg-encourager-lightgray">
        <div className="flex justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Competency {activeCategory + 1} of {totalCategories}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalCategories }).map((_, index) => (
              <div 
                key={index}
                className={`h-1 rounded-full ${
                  isMobile ? 'w-3' : 'w-6'
                } ${index === activeCategory ? 'bg-encourager' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <CardTitle className="text-2xl text-[#242323] encourager-header">{category.title}</CardTitle>
        <CardDescription className="text-encourager-gray">
          {category.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default CategoryHeader;

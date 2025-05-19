
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Category } from '@/utils/assessmentData';

interface CategoryProgressHeaderProps {
  activeCategory: number;
  totalCategories: number;
  currentCategory: Category;
}

const CategoryProgressHeader: React.FC<CategoryProgressHeaderProps> = ({
  activeCategory,
  totalCategories,
  currentCategory
}) => {
  return (
    <Card className="mb-10 encourager-card">
      <CardContent className="p-6 bg-encourager-lightgray">
        <div className="flex justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Category {activeCategory + 1} of {totalCategories}
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalCategories }).map((_, index) => (
              <div 
                key={index}
                className={`h-1 w-6 rounded-full ${index === activeCategory ? 'bg-encourager' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <CardTitle className="text-2xl text-[#242323] encourager-header">{currentCategory.title}</CardTitle>
        <CardDescription className="text-encourager-gray">
          {currentCategory.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default CategoryProgressHeader;

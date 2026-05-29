import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StyleGuide = () => {
  return (
    <div className="min-h-screen bg-encourager-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center pb-8 border-b">
          <h1 className="text-5xl font-normal font-oswald text-black mb-4">
            Leader Leap Style Guide
          </h1>
          <p className="text-xl text-slate-600">Color Palette, Typography, and Component Library</p>
        </div>

        {/* Color Palette Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">Color Palette</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {/* Background Color */}
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-background shadow-md border"></div>
              <p className="font-normal text-sm">Page Background</p>
              <p className="text-xs text-slate-500">#FAF8F1</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-background</p>
            </div>
            
            {/* Light Background Color */}
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-background-light shadow-md border"></div>
              <p className="font-normal text-sm">Card Background</p>
              <p className="text-xs text-slate-500">#FDFCF8</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-background-light</p>
            </div>
            
          </div>
          
          <h3 className="text-xl font-normal mb-4">Brand Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {/* Primary Colors */}
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager shadow-md"></div>
              <p className="font-normal text-sm">Brand Primary</p>
              <p className="text-xs text-slate-500">#2F5850</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-light shadow-md"></div>
              <p className="font-normal text-sm">Primary Hover</p>
              <p className="text-xs text-slate-500">#4A6A61</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-light</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-accent shadow-md"></div>
              <p className="font-normal text-sm">Brand Accent</p>
              <p className="text-xs text-slate-500">#C96736</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-accent-hover shadow-md"></div>
              <p className="font-normal text-sm">Accent Hover</p>
              <p className="text-xs text-slate-500">#D97745</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-accent-hover</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-gray shadow-md"></div>
              <p className="font-normal text-sm">Brand Gray</p>
              <p className="text-xs text-slate-500">#58595b</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-gray</p>
            </div>
          </div>
          
          {/* Utility Colors */}
          <h3 className="text-xl font-normal mb-4">Utility Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-encourager-lightgray shadow-md"></div>
              <p className="font-normal text-sm">UI Light Gray</p>
              <p className="text-xs text-slate-500">#f5f5f5</p>
              <p className="text-xs font-mono text-slate-400">bg-encourager-lightgray</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-white shadow-md border"></div>
              <p className="font-normal text-sm">White</p>
              <p className="text-xs text-slate-500">#ffffff</p>
              <p className="text-xs font-mono text-slate-400">bg-white</p>
            </div>
          </div>

          {/* System Colors */}
          <h3 className="text-xl font-normal mb-4">System Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-primary shadow-md"></div>
              <p className="text-sm">Primary</p>
              <p className="text-xs font-mono text-slate-400">bg-primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-secondary shadow-md"></div>
              <p className="text-sm">Secondary</p>
              <p className="text-xs font-mono text-slate-400">bg-secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-muted shadow-md"></div>
              <p className="text-sm">Muted</p>
              <p className="text-xs font-mono text-slate-400">bg-muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-destructive shadow-md"></div>
              <p className="text-sm">Destructive</p>
              <p className="text-xs font-mono text-slate-400">bg-destructive</p>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">Typography</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-card">
              <h3 className="text-lg font-normal mb-4">Font Families</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-oswald text-3xl">Oswald</p>
                  <p className="text-sm text-slate-500">Headers & Titles - font-oswald</p>
                </div>
                <div>
                  <p className="font-quicksand text-xl">Quicksand</p>
                  <p className="text-sm text-slate-500">Body Text - font-quicksand</p>
                </div>
                <div>
                  <p className="font-notica text-xl">Noto Sans</p>
                  <p className="text-sm text-slate-500">Special Text - font-notica</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-card">
              <h3 className="text-lg font-normal mb-4">Heading Styles</h3>
              <div className="space-y-4">
                <div>
                  <h1 className="heading-1">Heading 1</h1>
                  <p className="text-sm text-slate-500 font-mono">.heading-1</p>
                </div>
                <div>
                  <h2 className="heading-2">Heading 2</h2>
                  <p className="text-sm text-slate-500 font-mono">.heading-2</p>
                </div>
                <div>
                  <h3 className="heading-3">Heading 3</h3>
                  <p className="text-sm text-slate-500 font-mono">.heading-3</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">Buttons</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Button className="btn-primary w-full">Primary Button</Button>
                <p className="text-sm text-slate-500 font-mono">.btn-primary</p>
              </div>
              
              <div className="space-y-3">
                <Button className="btn-secondary w-full">Secondary Button</Button>
                <p className="text-sm text-slate-500 font-mono">.btn-secondary</p>
              </div>
              
              <div className="space-y-3">
                <Button className="btn-outline w-full">Outline Button</Button>
                <p className="text-sm text-slate-500 font-mono">.btn-outline</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-normal mb-4">Standard Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="encourager">Encourager</Button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-normal mb-4">Button Sizes</h3>
              <div className="flex items-end gap-4">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-feature">
              <h3 className="text-xl font-normal mb-2">Feature Card</h3>
              <p className="text-white/90">This is a feature card with dark green background.</p>
              <p className="text-sm text-white/70 mt-4 font-mono">.card-feature</p>
            </div>
            
            <div className="card-content">
              <h3 className="text-xl font-normal text-black mb-2">Content Card</h3>
              <p className="text-slate-600">This is a content card with white background.</p>
              <p className="text-sm text-slate-400 mt-4 font-mono">.card-content</p>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">Form Elements</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-card">
            <div className="max-w-md space-y-4">
              <div>
                <Label className="label-text">Label Text</Label>
                <Input className="input-field" placeholder="Input field with custom styling" />
                <p className="text-xs text-slate-500 mt-1 font-mono">.label-text + .input-field</p>
              </div>
              
              <div>
                <Label htmlFor="standard">Standard Input</Label>
                <Input id="standard" placeholder="Standard shadcn/ui input" />
              </div>
            </div>
          </div>
        </section>

        {/* Shadows Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">Shadows</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="font-normal">Small</p>
              <p className="text-sm text-slate-500 font-mono">shadow-sm</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-card">
              <p className="font-normal">Card</p>
              <p className="text-sm text-slate-500 font-mono">shadow-card</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-elevated">
              <p className="font-normal">Elevated</p>
              <p className="text-sm text-slate-500 font-mono">shadow-elevated</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="font-normal">Large</p>
              <p className="text-sm text-slate-500 font-mono">shadow-lg</p>
            </div>
          </div>
        </section>

        {/* CSS Variables Section */}
        <section>
          <h2 className="text-3xl font-normal font-oswald text-black mb-6">CSS Custom Properties</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-card">
            <div className="font-mono text-sm space-y-2">
              <p><span className="text-slate-500">--color-brand-primary:</span> #2F5850</p>
              <p><span className="text-slate-500">--color-brand-primary-hover:</span> #4A6A61</p>
              <p><span className="text-slate-500">--color-brand-accent:</span> #C96736</p>
              <p><span className="text-slate-500">--color-brand-accent-hover:</span> #D07A52</p>
              <p><span className="text-slate-500">--color-gray-dark:</span> #58595b</p>
              <p><span className="text-slate-500">--color-gray-light:</span> #f5f5f5</p>
            </div>
            
            <div className="mt-6 p-4 bg-slate-100 rounded">
              <p className="text-sm">Usage in CSS:</p>
              <code className="text-sm">background-color: var(--color-brand-primary);</code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StyleGuide;